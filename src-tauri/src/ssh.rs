use std::sync::Arc;
use tokio::sync::Mutex;

use crate::sources::models::{SshAuthType, SshTunnelConfig};

pub struct SshConfig {
    pub host: String,
    pub port: u16,
    pub username: String,
    pub auth: SshAuthMethod,
    pub known_host_key: Option<String>,
}

pub enum SshAuthMethod {
    Key { key_path: String, passphrase: String },
    Password { password: String },
}

impl From<&SshTunnelConfig> for SshConfig {
    fn from(t: &SshTunnelConfig) -> Self {
        let auth = match t.auth_type {
            SshAuthType::Password => SshAuthMethod::Password {
                password: t.password.clone().unwrap_or_default(),
            },
            SshAuthType::Key => SshAuthMethod::Key {
                key_path: t.key_path.clone().unwrap_or_default(),
                passphrase: t.passphrase.clone().unwrap_or_default(),
            },
        };
        SshConfig {
            host: t.host.clone(),
            port: t.port,
            username: t.username.clone(),
            auth,
            known_host_key: t.known_host_key.clone(),
        }
    }
}

pub struct TunnelGuard {
    pub local_port: u16,
    _abort: AbortOnDrop,
}

struct AbortOnDrop(tokio::task::AbortHandle);
impl Drop for AbortOnDrop {
    fn drop(&mut self) {
        self.0.abort();
    }
}

pub async fn open_ssh_tunnel(ssh: &SshConfig, db_host: &str, db_port: u16) -> Result<TunnelGuard, String> {
    struct KeyChecker {
        expected: Option<String>,
    }
    #[async_trait::async_trait]
    impl russh::client::Handler for KeyChecker {
        type Error = russh::Error;
        async fn check_server_key(
            &mut self,
            key: &russh_keys::key::PublicKey,
        ) -> Result<bool, Self::Error> {
            match &self.expected {
                None => Ok(true),
                Some(fp) => Ok(key.fingerprint() == *fp),
            }
        }
    }

    let config = Arc::new(russh::client::Config::default());
    let mut handle = tokio::time::timeout(
        tokio::time::Duration::from_secs(10),
        russh::client::connect(
            config,
            (ssh.host.as_str(), ssh.port),
            KeyChecker { expected: ssh.known_host_key.clone() },
        ),
    )
    .await
    .map_err(|_| format!("Timeout connexion SSH vers {}:{}", ssh.host, ssh.port))?
    .map_err(|e| {
        if ssh.known_host_key.is_some() && matches!(e, russh::Error::WrongServerSig) {
            format!(
                "Empreinte du serveur SSH {}:{} différente — possible attaque MITM.",
                ssh.host, ssh.port
            )
        } else {
            format!("Connexion SSH : {e}")
        }
    })?;

    let authenticated = match &ssh.auth {
        SshAuthMethod::Key { key_path, passphrase } => {
            let pass = if passphrase.is_empty() { None } else { Some(passphrase.as_str()) };
            let key_pair = russh_keys::load_secret_key(key_path, pass)
                .map_err(|e| format!("Clé privée '{key_path}' : {e}"))?;
            handle
                .authenticate_publickey(&ssh.username, Arc::new(key_pair))
                .await
                .map_err(|e| format!("Auth SSH (clé) : {e}"))?
        }
        SshAuthMethod::Password { password } => handle
            .authenticate_password(&ssh.username, password)
            .await
            .map_err(|e| format!("Auth SSH (mdp) : {e}"))?,
    };

    if !authenticated {
        return Err("Authentification SSH refusée.".to_string());
    }

    let listener = tokio::net::TcpListener::bind("127.0.0.1:0")
        .await
        .map_err(|e| format!("Port local : {e}"))?;
    let local_port = listener.local_addr().map_err(|e| e.to_string())?.port();

    let handle = Arc::new(Mutex::new(handle));
    let db_host = db_host.to_string();

    let task = tokio::spawn(async move {
        loop {
            let Ok((mut tcp, _)) = listener.accept().await else { break };
            let handle = Arc::clone(&handle);
            let db_host = db_host.clone();
            tokio::spawn(async move {
                let ch = {
                    let h = handle.lock().await;
                    h.channel_open_direct_tcpip(&db_host, db_port as u32, "127.0.0.1", 0).await
                };
                if let Ok(ch) = ch {
                    let mut stream = ch.into_stream();
                    let _ = tokio::io::copy_bidirectional(&mut tcp, &mut stream).await;
                }
            });
        }
    });

    Ok(TunnelGuard { local_port, _abort: AbortOnDrop(task.abort_handle()) })
}

pub async fn open_tunnel_if_needed(
    ssh: Option<&SshConfig>,
    db_host: &str,
    db_port: u16,
) -> Result<Option<TunnelGuard>, String> {
    match ssh {
        Some(cfg) => open_ssh_tunnel(cfg, db_host, db_port).await.map(Some),
        None => Ok(None),
    }
}

pub fn effective_addr<'a>(tunnel: &'a Option<TunnelGuard>, host: &'a str, port: u16) -> (&'a str, u16) {
    match tunnel {
        Some(t) => ("127.0.0.1", t.local_port),
        None => (host, port),
    }
}

/// Teste le tunnel SSH et retourne l'empreinte SHA-256 du serveur.
/// Persiste ce fingerprint dans `known_host_key` pour activer la vérification TOFU.
pub async fn test_ssh_tunnel(cfg: &SshTunnelConfig) -> Result<String, String> {
    struct KeyCapture {
        expected: Option<String>,
        observed: Arc<Mutex<Option<String>>>,
    }
    #[async_trait::async_trait]
    impl russh::client::Handler for KeyCapture {
        type Error = russh::Error;
        async fn check_server_key(
            &mut self,
            key: &russh_keys::key::PublicKey,
        ) -> Result<bool, Self::Error> {
            let fp = key.fingerprint();
            *self.observed.lock().await = Some(fp.clone());
            match &self.expected {
                None => Ok(true),
                Some(kk) => Ok(*kk == fp),
            }
        }
    }

    let observed = Arc::new(Mutex::new(None::<String>));
    let config = Arc::new(russh::client::Config::default());
    let mut session = tokio::time::timeout(
        tokio::time::Duration::from_secs(10),
        russh::client::connect(
            config,
            (cfg.host.as_str(), cfg.port),
            KeyCapture {
                expected: cfg.known_host_key.clone(),
                observed: Arc::clone(&observed),
            },
        ),
    )
    .await
    .map_err(|_| format!("Timeout — impossible de joindre {}:{}", cfg.host, cfg.port))?
    .map_err(|e| {
        if cfg.known_host_key.is_some() && matches!(e, russh::Error::WrongServerSig) {
            "Empreinte différente de celle enregistrée — possible attaque MITM.".to_string()
        } else {
            format!("Connexion SSH échouée : {e}")
        }
    })?;

    let authenticated = match &cfg.auth_type {
        SshAuthType::Password => session
            .authenticate_password(
                &cfg.username,
                cfg.password.as_deref().unwrap_or_default(),
            )
            .await
            .map_err(|e| format!("Erreur authentification : {e}"))?,
        SshAuthType::Key => {
            let key_path = cfg.key_path.as_deref().unwrap_or("").trim();
            if key_path.is_empty() {
                return Err("Chemin de la clé privée non spécifié".to_string());
            }
            let pass = cfg.passphrase.as_deref().filter(|s| !s.is_empty());
            let key_pair = russh_keys::load_secret_key(key_path, pass)
                .map_err(|e| format!("Impossible de charger la clé privée : {e}"))?;
            session
                .authenticate_publickey(&cfg.username, Arc::new(key_pair))
                .await
                .map_err(|e| format!("Erreur authentification clé : {e}"))?
        }
    };

    if !authenticated {
        return Err("Authentification refusée — vérifiez vos identifiants.".to_string());
    }

    let _ = session.disconnect(russh::Disconnect::ByApplication, "", "English").await;
    let fp = observed.lock().await.clone().unwrap_or_default();
    Ok(fp)
}

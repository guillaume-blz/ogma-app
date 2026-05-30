# Ogma — Project Summary

## Vision

Ogma est une plateforme de **gestion, transformation et visualisation de données** destinée aux équipes techniques et analytiques. Elle permet de connecter des sources de données hétérogènes, de les interroger, de les transformer via des pipelines, et d'en produire des visualisations et dashboards.

Le produit vise deux modes de déploiement :
- **Self-hosted** (image Docker) — free ou premium, données qui ne quittent pas l'infrastructure client
- **SaaS** — pour les clients sans infrastructure à gérer

---

## État actuel

Le dépôt contient le **frontend desktop** (application Tauri), qui sert de prototype fonctionnel pour valider l'UX et le modèle de données. Le backend est un backend Rust embarqué via Tauri (IPC `invoke()`), destiné à être remplacé par Spring Boot.

---

## Modules fonctionnels

| Module | Description |
|---|---|
| **Sources** | Connexion à des sources de données (BDD, fichiers, API, SaaS) avec test de connexion et exploration de schéma |
| **Pipelines** | Définition de transformations et flux de données entre sources |
| **Data Models** | Modèles de données abstraits indépendants des sources |
| **Visualisations** | Graphiques et vues construites sur des requêtes |
| **Dashboards** | Composition de visualisations en tableaux de bord |
| **Schedules** | Planification de tâches (cron) |
| **Jobs** | Suivi d'exécution des tâches planifiées |
| **Exports** | Export de données (formats à définir) |
| **Shared** | Ressources partagées entre utilisateurs |
| **Settings** | Préférences UI (thème, langue, police) |

---

## Stack technique — Frontend

| Technologie | Rôle |
|---|---|
| React 19 + Vite | UI |
| Tauri 2 | Shell desktop (macOS / Windows / Linux) |
| React Router 7 | Routing client-side |
| Zustand 5 | État UI (tabs, sidebar, thème, command palette) |
| TanStack Query 5 | État serveur (fetch, cache, invalidation) |
| TanStack Table 8 | Tableaux de données |
| Tailwind CSS 4 | Styles |
| Base UI React | Composants primitifs accessibles |
| i18next | Internationalisation (EN / FR / JA) |
| Vitest | Tests unitaires |

---

## Stack technique — Backend (cible)

| Technologie | Rôle |
|---|---|
| Spring Boot | API REST, query engine, gestion des sources |
| Keycloak | Authentification et autorisation (OIDC / OAuth2) |
| PostgreSQL | Base de métadonnées Ogma (sources, pipelines, dashboards...) |
| DuckDB | Couche analytique embarquée (matérialisation des pipelines) |
| Docker / Docker Compose | Packaging et déploiement |

---

## Modèle de données clé

```
Source
├── id, name, created_at, updated_at
├── source_type: "database" | "files" | "api" | "saas"
└── config: DatabaseConfig
       ├── driver: postgres | mysql | mariadb | sqlite
       ├── host, port, database, username, password
       └── ssh_tunnel?: SshTunnelConfig

AbstractQuery
├── table, columns?
├── filters?: Filter[]      (eq, ne, gt, gte, lt, lte, like, in, is_null…)
├── order_by?: OrderBy[]
├── limit?, offset?
└── → QueryResult { columns, rows, total }

Schema
└── tables: TableSchema[]
       └── columns: ColumnSchema[] { name, data_type, nullable }
```

---

## Architecture cible

```
┌──────────────── Self-hosted (Docker Compose) ─────────────────┐
│                                                                │
│   ogma-backend (Spring Boot)                                  │
│   ogma-keycloak                                               │
│   ogma-postgres (metadata)                                    │
│                                                               │
│   Connexion directe aux sources dans le réseau client         │
└────────────────────────────────────────────────────────────────┘

┌──────────────── SaaS ─────────────────────────────────────────┐
│   app.ogma.io                                                  │
│   Spring Boot (multi-tenant) + Keycloak + PostgreSQL metadata  │
│                                                                │
│   Sources cloud    → connexion directe                        │
│   Sources privées  → via ogma/agent (1 container chez client) │
└────────────────────────────────────────────────────────────────┘
```

### Clients

| Client | Cible | Usage |
|---|---|---|
| **Tauri Desktop** | Self-hosted & SaaS | Gestion (sources, pipelines, schedules, jobs) |
| **Web App (Next.js)** | Self-hosted & SaaS | Visualisation (dashboards, partage) |

### Couche connecteur Spring Boot

```java
interface SourceConnector {
    QueryResult execute(AbstractQuery query);
}

// Même réseau que Spring Boot
class DirectConnector implements SourceConnector { ... }

// Sources derrière firewall (SaaS uniquement)
class AgentConnector implements SourceConnector { ... }
```

---

## Stratégie de gestion des données sources

Deux modes coexistent selon l'usage, sans se remplacer :

| Mode | Usage | Implémentation |
|---|---|---|
| **Direct query** | Exploration, preview, test de connexion | Spring Boot → Source externe |
| **Matérialisation** | Dashboards, visualisations, exports | Pipeline → DuckDB |

### Direct query

Spring Boot se connecte à la source et retourne le résultat immédiatement, sans stockage intermédiaire. Utilisé pour toutes les opérations d'exploration :

- Introspection de schéma (`/sources/{id}/schema`)
- Preview de table (`/sources/{id}/tables/{table}/data`)
- Test de connexion
- Requête ad hoc

### Matérialisation via DuckDB

Les pipelines extraient les données des sources et les matérialisent dans DuckDB (base analytique embarquée dans Spring Boot). Les dashboards interrogent DuckDB, jamais les sources directement.

```
Schedule → Job → Pipeline → Source externe
                                  │
                            [matérialisation]
                                  │
                               DuckDB
                                  │
                        Dashboard / Visualisation
```

**Pourquoi DuckDB (vs PostgreSQL Ogma ou ClickHouse) :**
- Zéro infrastructure supplémentaire (fichier embarqué)
- Performances analytiques excellentes (colonnar, vectorisé)
- Joins cross-sources nativement possibles
- Peut être remplacé par un DWH externe (ClickHouse, BigQuery) sans changer l'interface

### Vue d'ensemble Spring Boot

```
┌─────────────────────────────────────────────────────┐
│                    Spring Boot                      │
│                                                     │
│  SourceConnector          MaterializationEngine     │
│  (direct query)           (pipelines / schedules)   │
│        │                          │                 │
│   Sources externes            DuckDB               │
│   (PostgreSQL, MySQL…)            │                 │
│                          DashboardQueryEngine       │
└─────────────────────────────────────────────────────┘
```

---

## Modèle commercial

| Tier | Mode | Limites |
|---|---|---|
| **Free** | Self-hosted Docker | Sources limitées, utilisateurs limités, pas de SSO |
| **Premium** | Self-hosted Docker | Illimité, SSO/LDAP via Keycloak, support SLA |
| **SaaS** | Cloud Ogma | Par seat, agent privé inclus, support SLA |

---

## Roadmap technique (ordre conseillé)

1. **Spring Boot — API self-hosted** : CRUD sources, query engine, schéma
2. **Keycloak** : auth JWT, intégration Spring Boot Resource Server
3. **Migration frontend** : remplacer les `invoke()` Tauri par des appels HTTP
4. **Web App Next.js** : dashboards et visualisations (lecture seule)
5. **Multi-tenant SaaS** : isolation par `tenantId`, realm Keycloak par organisation
6. **Agent léger** : connexion sortante pour sources privées (SaaS uniquement)

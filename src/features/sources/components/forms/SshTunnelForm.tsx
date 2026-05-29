import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { ShieldCheck, ShieldAlert, Loader2, Server, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { SshAuthType, SshTunnelConfig } from "../../types";

const DEFAULT_SSH: SshTunnelConfig = {
  host: "",
  port: 22,
  username: "",
  auth_type: "password",
};

interface SshTunnelFormProps {
  value: SshTunnelConfig | undefined;
  onChange: (config: SshTunnelConfig | undefined) => void;
}

type TestState = "idle" | "loading" | "ok" | "error";

export function SshTunnelForm({ value, onChange }: SshTunnelFormProps) {
  const enabled = value !== undefined;
  const [testState, setTestState] = useState<TestState>("idle");
  const [testError, setTestError] = useState<string | null>(null);
  const [pendingFingerprint, setPendingFingerprint] = useState<string | null>(null);

  const toggle = () => {
    onChange(enabled ? undefined : DEFAULT_SSH);
    setTestState("idle");
    setTestError(null);
    setPendingFingerprint(null);
  };

  const set = (patch: Partial<SshTunnelConfig>) =>
    onChange({ ...(value ?? DEFAULT_SSH), ...patch });

  const handleTest = async () => {
    if (!value) return;
    setTestState("loading");
    setTestError(null);
    setPendingFingerprint(null);
    try {
      const fp = await invoke<string>("source_test_ssh", { config: value });
      setTestState("ok");
      if (!value.known_host_key) {
        setPendingFingerprint(fp);
      }
    } catch (e) {
      setTestState("error");
      setTestError(String(e));
    }
  };

  const trustFingerprint = () => {
    if (!pendingFingerprint) return;
    set({ known_host_key: pendingFingerprint });
    setPendingFingerprint(null);
  };

  return (
    <div className="space-y-3">
      {/* Toggle */}
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Server className="size-3.5" />
          <span>SSH Tunnel</span>
        </div>
        <div className={cn(
          "h-4 w-7 rounded-full transition-colors",
          enabled ? "bg-primary" : "bg-border"
        )}>
          <div className={cn(
            "mt-0.5 size-3 rounded-full bg-white shadow transition-transform mx-0.5",
            enabled ? "translate-x-3" : "translate-x-0"
          )} />
        </div>
      </button>

      {enabled && value && (
        <div className="space-y-3 rounded-md border border-border p-3">
          {/* Host / Port */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Field label="SSH Host">
                <Input
                  placeholder="bastion.example.com"
                  value={value.host}
                  onChange={(e) => set({ host: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Port">
              <Input
                type="number"
                placeholder="22"
                value={value.port}
                onChange={(e) => set({ port: Number(e.target.value) })}
              />
            </Field>
          </div>

          {/* Username */}
          <Field label="Username">
            <Input
              placeholder="ubuntu"
              value={value.username}
              onChange={(e) => set({ username: e.target.value })}
            />
          </Field>

          {/* Auth type */}
          <Field label="Authentication">
            <Select
              value={value.auth_type}
              onValueChange={(v) => v && set({ auth_type: v as SshAuthType })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="password">Password</SelectItem>
                <SelectItem value="key">Private key</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {value.auth_type === "password" && (
            <Field label="Password">
              <Input
                type="password"
                placeholder="••••••••"
                value={value.password ?? ""}
                onChange={(e) => set({ password: e.target.value })}
              />
            </Field>
          )}

          {value.auth_type === "key" && (
            <>
              <Field label="Private key path">
                <div className="flex gap-1.5">
                  <Input
                    placeholder="~/.ssh/id_ed25519"
                    value={value.key_path ?? ""}
                    onChange={(e) => set({ key_path: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const selected = await openDialog({ multiple: false });
                      if (typeof selected === "string") set({ key_path: selected });
                    }}
                    className="flex shrink-0 items-center justify-center size-8 rounded-md border border-input text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    aria-label="Browse"
                  >
                    <FolderOpen className="size-3.5" />
                  </button>
                </div>
              </Field>
              <Field label="Passphrase">
                <Input
                  type="password"
                  placeholder="(optional)"
                  value={value.passphrase ?? ""}
                  onChange={(e) => set({ passphrase: e.target.value })}
                />
              </Field>
            </>
          )}

          {/* Test + TOFU */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleTest}
              disabled={testState === "loading"}
              className={cn(
                "flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm",
                "text-muted-foreground transition-colors hover:text-foreground hover:bg-muted",
                "disabled:opacity-50"
              )}
            >
              {testState === "loading"
                ? <Loader2 className="size-3.5 animate-spin" />
                : <ShieldCheck className="size-3.5" />}
              Test SSH connection
            </button>

            {testState === "ok" && !pendingFingerprint && (
              <p className="flex items-center gap-1.5 text-xs text-green-500">
                <ShieldCheck className="size-3" />
                Connected{value.known_host_key && " · fingerprint verified"}
              </p>
            )}

            {testState === "ok" && pendingFingerprint && (
              <div className="space-y-1.5 rounded-md border border-amber-500/30 bg-amber-500/5 p-2.5">
                <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                  <ShieldAlert className="size-3 shrink-0" />
                  Connected — server fingerprint not yet trusted
                </p>
                <p className="break-all font-mono text-[10px] text-muted-foreground">
                  {pendingFingerprint}
                </p>
                <button
                  type="button"
                  onClick={trustFingerprint}
                  className="rounded border border-amber-500/40 px-2 py-0.5 text-xs text-amber-600 hover:bg-amber-500/10 dark:text-amber-400 transition-colors"
                >
                  Trust this server
                </button>
              </div>
            )}

            {testState === "error" && (
              <p className="text-xs text-destructive">{testError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-8 w-full rounded-md border border-input bg-background px-3 text-sm",
        "placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring",
        props.className
      )}
    />
  );
}

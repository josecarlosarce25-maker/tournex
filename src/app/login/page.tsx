"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { Button, Input, Field } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";
import { store } from "@/lib/data/use-store";

type Mode = "signin" | "signup";
type Stage = "form" | "magic-sent" | "reset-sent" | "signup-needs-confirm";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [stage, setStage] = useState<Stage>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  // If already signed in, skip straight to the dashboard.
  useEffect(() => {
    let cancelled = false;
    store.getUser().then((u) => {
      if (!cancelled && u) router.replace("/dashboard");
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast("Email y contraseña son obligatorios", "error");
      return;
    }
    setBusy(true);
    if (mode === "signin") {
      const r = await store.signInWithPassword(email.trim(), password);
      setBusy(false);
      if (!r.ok) {
        toast(r.error ?? "No se pudo iniciar sesión", "error");
        return;
      }
      router.replace("/dashboard");
    } else {
      if (!name.trim()) {
        toast("Tu nombre es obligatorio", "error");
        setBusy(false);
        return;
      }
      const r = await store.signUpWithPassword(
        email.trim(),
        password,
        name.trim(),
        phone.trim() || undefined,
      );
      setBusy(false);
      if (!r.ok) {
        toast(r.error ?? "No se pudo crear la cuenta", "error");
        return;
      }
      if (r.confirmed) {
        toast(`¡Bienvenido, ${name.trim()}!`);
        router.replace("/dashboard");
      } else {
        setStage("signup-needs-confirm");
      }
    }
  }

  async function handleMagicLink() {
    if (!email.trim()) {
      toast("Necesito tu email para mandarte el link", "error");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      toast("Tu nombre es obligatorio", "error");
      return;
    }
    setBusy(true);
    const r = await store.signInWithMagicLink(
      email.trim(),
      name.trim() || email.split("@")[0],
      phone.trim() || undefined,
    );
    setBusy(false);
    if (!r.ok) {
      toast(r.error ?? "No se pudo mandar el link", "error");
      return;
    }
    setStage("magic-sent");
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      toast(
        "Escribe tu email arriba y vuelve a darle a 'Olvidé mi contraseña'",
        "error",
      );
      return;
    }
    setBusy(true);
    const r = await store.sendPasswordReset(email.trim());
    setBusy(false);
    if (!r.ok) {
      toast(r.error ?? "Error", "error");
      return;
    }
    setStage("reset-sent");
  }

  async function handleGoogle() {
    setBusy(true);
    const { error } = await store.supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setBusy(false);
      toast(
        error.message.includes("not enabled")
          ? "Google login aún no está configurado. Usa email + contraseña."
          : error.message,
        "error",
      );
    }
  }

  // ── Confirmation screens ─────────────────────────────────────

  if (stage === "magic-sent" || stage === "signup-needs-confirm") {
    return (
      <CenteredCard>
        <Icon emoji="✉️" />
        <h2 className="text-xl font-bold">Revisa tu correo</h2>
        <p className="mt-2 text-sm text-tx2">
          {stage === "signup-needs-confirm"
            ? "Te mandamos un correo para confirmar tu cuenta."
            : "Te mandamos un link a "}
          {stage === "magic-sent" && (
            <span className="font-semibold text-tx">{email}</span>
          )}
          {stage === "signup-needs-confirm" ? null : (
            <>. Ábrelo desde este dispositivo.</>
          )}
        </p>
        <button
          onClick={() => setStage("form")}
          className="mt-5 text-xs font-semibold text-tx3 underline hover:text-tx"
        >
          Volver
        </button>
      </CenteredCard>
    );
  }

  if (stage === "reset-sent") {
    return (
      <CenteredCard>
        <Icon emoji="🔑" />
        <h2 className="text-xl font-bold">Te mandamos un link</h2>
        <p className="mt-2 text-sm text-tx2">
          Abre el correo y elige una contraseña nueva.
        </p>
        <button
          onClick={() => setStage("form")}
          className="mt-5 text-xs font-semibold text-tx3 underline hover:text-tx"
        >
          Volver
        </button>
      </CenteredCard>
    );
  }

  // ── Main form ────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="surface glow rounded-xl p-10">
          <div className="mb-8 flex items-center justify-center gap-2.5">
            <Logo size={38} />
            <h1 className="text-2xl font-bold tracking-tight">Tournex</h1>
          </div>

          {/* Sign-in / Sign-up toggle */}
          <div className="mb-6 flex items-center justify-center rounded-full bg-bg2 p-1 ring-1 ring-hair">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`rounded-full px-5 py-1.5 text-xs font-semibold transition-all ${
                mode === "signin"
                  ? "bg-bg3 text-tx ring-1 ring-inset ring-hair"
                  : "text-tx3 hover:text-tx"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-full px-5 py-1.5 text-xs font-semibold transition-all ${
                mode === "signup"
                  ? "bg-lime/12 text-lime ring-1 ring-inset ring-lime/30"
                  : "text-tx3 hover:text-tx"
              }`}
            >
              Crear cuenta
            </button>
          </div>

          {/* Google sign-in */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="mb-4 flex w-full items-center justify-center gap-2.5 rounded-soft border border-br2 bg-bg2 px-4 py-3 text-sm font-semibold text-tx transition-all hover:-translate-y-0.5 hover:border-tx3 disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.71H.957v2.332A8.997 8.997 0 009 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
              />
            </svg>
            Continuar con Google
          </button>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-hair" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-tx3">
              o con correo
            </span>
            <div className="h-px flex-1 bg-hair" />
          </div>

          <form onSubmit={handlePasswordSubmit}>
            {mode === "signup" && (
              <>
                <Field label="Nombre">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    autoComplete="name"
                  />
                </Field>
                <Field label="WhatsApp (opcional)">
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="33 1234 5678"
                    autoComplete="tel"
                  />
                </Field>
              </>
            )}
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                autoComplete="email"
              />
            </Field>
            <Field label="Contraseña">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "Mínimo 6 caracteres" : "•••••••"}
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
              />
            </Field>
            <Button type="submit" full disabled={busy}>
              {busy
                ? "Cargando…"
                : mode === "signin"
                  ? "Entrar →"
                  : "Crear cuenta →"}
            </Button>
          </form>

          {/* Secondary options */}
          <div className="mt-4 flex flex-col items-center gap-2 text-xs">
            {mode === "signin" && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-tx3 underline hover:text-tx"
              >
                Olvidé mi contraseña
              </button>
            )}
            <button
              type="button"
              onClick={handleMagicLink}
              className="text-tx3 underline hover:text-tx"
            >
              {mode === "signin"
                ? "Mejor entrar con un link mágico"
                : "Crear cuenta sin contraseña (link mágico)"}
            </button>
          </div>
        </div>

        <p className="mx-auto mt-5 max-w-sm text-center text-[11px] leading-relaxed text-tx3">
          Al entrar, aceptas guardar tus torneos en la nube de Tournex. Tu
          sesión queda recordada por meses — solo te pide login otra vez si
          manualmente cierras sesión.
        </p>
      </div>
    </div>
  );
}

// ── Small helpers ──────────────────────────────────────────────

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="surface glow rounded-xl p-10 text-center">{children}</div>
      </div>
    </div>
  );
}

function Icon({ emoji }: { emoji: string }) {
  return (
    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-bg3 text-3xl ring-1 ring-hair">
      {emoji}
    </div>
  );
}

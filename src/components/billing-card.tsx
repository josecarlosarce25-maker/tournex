// Subscription card for the dashboard. Shows the organizer's current plan
// and lets them subscribe (Stripe Checkout, 30-day trial) or manage an
// existing subscription (Stripe Customer Portal).
"use client";

import { useState } from "react";
import { toast } from "@/components/ui/toast";
import type { Organizer } from "@/lib/types";

interface Props {
  user: Organizer | null;
}

const PLAN_LABEL: Record<string, string> = {
  free: "Gratis",
  pro: "Pro",
  club: "Club",
};

const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  trialing: { text: "En prueba de 30 días", color: "text-lime" },
  active: { text: "Activa", color: "text-lime" },
  past_due: { text: "Pago pendiente", color: "text-orange" },
  canceled: { text: "Cancelada", color: "text-tx3" },
  free: { text: "", color: "" },
};

export function BillingCard({ user }: Props) {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [busy, setBusy] = useState<string | null>(null);

  const plan = user?.subscriptionPlan ?? "free";
  const status = user?.subscriptionStatus ?? "free";
  const isSubscribed = plan === "pro" || plan === "club";

  async function subscribe(targetPlan: "pro" | "club") {
    setBusy(targetPlan);
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: targetPlan, billing }),
      });
      const data = await r.json();
      if (!r.ok || !data.url) {
        toast(data.error ?? "No se pudo iniciar el pago", "error");
        setBusy(null);
        return;
      }
      window.location.assign(data.url);
    } catch {
      toast("Error de conexión", "error");
      setBusy(null);
    }
  }

  async function openPortal() {
    setBusy("portal");
    try {
      const r = await fetch("/api/portal", { method: "POST" });
      const data = await r.json();
      if (!r.ok || !data.url) {
        toast(data.error ?? "No se pudo abrir el portal", "error");
        setBusy(null);
        return;
      }
      window.location.assign(data.url);
    } catch {
      toast("Error de conexión", "error");
      setBusy(null);
    }
  }

  // ── Already subscribed: show status + manage button ──────────────
  if (isSubscribed) {
    const st = STATUS_LABEL[status] ?? STATUS_LABEL.active;
    return (
      <div className="surface relative mb-7 overflow-hidden rounded-card p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-lime/15 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold">
                Plan {PLAN_LABEL[plan] ?? plan}
              </h3>
              {st.text && (
                <span
                  className={`rounded-full bg-bg3 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider ring-1 ring-inset ring-hair ${st.color}`}
                >
                  {st.text}
                </span>
              )}
            </div>
            <p className="mt-1 text-[13px] text-tx2">
              Gestiona tu plan, cambia de tarjeta o cancela cuando quieras.
            </p>
          </div>
          <button
            type="button"
            onClick={openPortal}
            disabled={busy !== null}
            className="rounded-soft border border-br2 bg-bg2 px-4 py-2.5 text-sm font-semibold text-tx transition-all hover:-translate-y-0.5 hover:border-tx3 disabled:opacity-60"
          >
            {busy === "portal" ? "Abriendo…" : "Gestionar suscripción"}
          </button>
        </div>
      </div>
    );
  }

  // ── Free user: show upgrade CTA ──────────────────────────────────
  return (
    <div className="surface glow relative mb-7 overflow-hidden rounded-card p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-lime/20 blur-3xl" />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold">Desbloquea Tournex Pro</h3>
              <span className="rounded-full bg-lime/15 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-lime ring-1 ring-inset ring-lime/30">
                30 DÍAS GRATIS
              </span>
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-tx2">
              Torneos y parejas ilimitadas, resultados en vivo, liga semanal y
              acceso anticipado al asistente con IA.{" "}
              <span className="text-lime">No pagas nada los primeros 30 días.</span>
            </p>
          </div>

          {/* Monthly / annual toggle */}
          <div className="inline-flex items-center gap-1 rounded-full border border-hair bg-bg2 p-1">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                billing === "monthly"
                  ? "bg-bg3 text-tx ring-1 ring-inset ring-hair"
                  : "text-tx3 hover:text-tx"
              }`}
            >
              Mensual
            </button>
            <button
              type="button"
              onClick={() => setBilling("annual")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                billing === "annual"
                  ? "bg-lime/12 text-lime ring-1 ring-inset ring-lime/30"
                  : "text-tx3 hover:text-tx"
              }`}
            >
              Anual −20%
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => subscribe("pro")}
            disabled={busy !== null}
            className="flex-1 rounded-soft bg-gradient-to-b from-lime2 to-lime px-4 py-3 text-center text-sm font-semibold text-bg shadow-[0_4px_20px_-4px_rgba(173,255,47,0.5)] transition-all hover:-translate-y-0.5 disabled:opacity-60"
          >
            {busy === "pro"
              ? "Redirigiendo…"
              : `Probar Pro — ${billing === "annual" ? "$79" : "$99"}/mes`}
          </button>
          <button
            type="button"
            onClick={() => subscribe("club")}
            disabled={busy !== null}
            className="flex-1 rounded-soft border border-br2 bg-bg2 px-4 py-3 text-center text-sm font-semibold text-tx transition-all hover:-translate-y-0.5 hover:border-tx3 disabled:opacity-60"
          >
            {busy === "club"
              ? "Redirigiendo…"
              : `Club — ${billing === "annual" ? "$199" : "$249"}/mes`}
          </button>
        </div>
      </div>
    </div>
  );
}

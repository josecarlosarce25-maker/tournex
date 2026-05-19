// Pricing section with monthly / annual billing toggle.
// Annual saves 20% — ~2.4 months free per year.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { store } from "@/lib/data/use-store";
import { toast } from "@/components/ui/toast";

interface Plan {
  id: "free" | "pro" | "club";
  name: string;
  monthly: number;
  annual: number; // total per year, already with 20% off
  features: string[];
  cta: string;
  highlight: boolean;
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    annual: 0,
    features: [
      "1 torneo",
      "Hasta 16 parejas",
      "Brackets y horarios",
      "Link para compartir",
    ],
    cta: "Empezar gratis",
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 99,
    annual: 950, // $99 × 12 × 0.80 = $950.40 → redondeado
    features: [
      "Torneos ilimitados",
      "Parejas ilimitadas",
      "Resultados en vivo",
      "Base de contactos",
      "Liga semanal",
      "Asistente IA · Preventa incluida",
    ],
    cta: "Probar Pro",
    highlight: true,
  },
  {
    id: "club",
    name: "Club",
    monthly: 249,
    annual: 2388, // $249 × 12 × 0.80 = $2,390.40 → $2,388
    features: [
      "Todo lo de Pro",
      "Cobro integrado (MercadoPago)",
      "Exportar brackets",
      "Tu logo en todo",
      "Soporte prioritario",
      "Asistente IA · Preventa incluida",
    ],
    cta: "Suscribirme al Club",
    highlight: false,
  },
];

function formatPrice(n: number): string {
  return n.toLocaleString("es-MX");
}

export function PricingSection() {
  const router = useRouter();
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function handleSubscribe(planId: "free" | "pro" | "club") {
    if (planId === "free") {
      router.push("/login");
      return;
    }
    // Need to be signed in first.
    const user = await store.getUser();
    if (!user) {
      // Park the intent in sessionStorage so we can resume after login.
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "pendingCheckout",
          JSON.stringify({ plan: planId, billing }),
        );
      }
      router.push("/login");
      return;
    }
    setLoadingPlan(planId);
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, billing }),
      });
      const data = await r.json();
      if (!r.ok || !data.url) {
        toast(data.error ?? "No se pudo iniciar el pago", "error");
        setLoadingPlan(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      toast("Error de conexión", "error");
      setLoadingPlan(null);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-center text-4xl font-bold tracking-tight">
        Precios simples
      </h2>
      <p className="mt-3 text-center text-tx2">
        Empieza gratis. Sube de plan cuando tu torneo crezca.
      </p>

      {/* Billing toggle */}
      <div className="mt-8 flex items-center justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-hair bg-bg2 p-1">
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
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
            className={`relative rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              billing === "annual"
                ? "bg-lime/12 text-lime ring-1 ring-inset ring-lime/30"
                : "text-tx3 hover:text-tx"
            }`}
          >
            Anual
            <span className="ml-1.5 rounded-full bg-lime/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-lime">
              −20%
            </span>
          </button>
        </div>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {PLANS.map((p) => {
          const isFree = p.monthly === 0;
          const monthlyEquivalent =
            billing === "annual" && p.annual > 0
              ? Math.round(p.annual / 12)
              : p.monthly;
          const annualSavings =
            p.monthly > 0 ? p.monthly * 12 - p.annual : 0;

          return (
            <div
              key={p.name}
              className={`relative rounded-card p-8 ${
                p.highlight ? "surface glow" : "surface"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-8 rounded-full bg-gradient-to-b from-lime2 to-lime px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-bg">
                  Más popular
                </span>
              )}
              <h3 className="text-lg font-bold">{p.name}</h3>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-mono text-5xl font-bold tracking-tight">
                  ${formatPrice(monthlyEquivalent)}
                </span>
                <span className="text-sm text-tx3">
                  {isFree
                    ? "para siempre"
                    : billing === "annual"
                      ? "MXN / mes · anual"
                      : "MXN / mes"}
                </span>
              </div>

              {!isFree && billing === "annual" && (
                <p className="mt-1 text-[11px] text-tx3">
                  ${formatPrice(p.annual)} MXN al año · ahorras $
                  {formatPrice(annualSavings)}
                </p>
              )}
              {!isFree && billing === "monthly" && p.annual > 0 && (
                <p className="mt-1 text-[11px] text-tx3">
                  o ${formatPrice(Math.round(p.annual / 12))} /mes pagando anual
                </p>
              )}

              <ul className="mt-7 space-y-3">
                {p.features.map((feat) => {
                  const isAI = feat.toLowerCase().includes("asistente ia");
                  return (
                    <li
                      key={feat}
                      className="flex items-start gap-2.5 text-sm text-tx2"
                    >
                      <span className="mt-0.5 text-lime">✓</span>
                      <span className={isAI ? "text-tx" : ""}>
                        {feat}
                        {isAI && (
                          <span className="ml-1 inline-flex items-center rounded-full bg-lime/12 px-1.5 py-0.5 align-middle font-mono text-[9px] font-bold text-lime ring-1 ring-inset ring-lime/25">
                            PRONTO
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                onClick={() => handleSubscribe(p.id)}
                disabled={loadingPlan !== null}
                className={`mt-8 block w-full rounded-soft py-3 text-center text-sm font-semibold transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 ${
                  p.highlight
                    ? "bg-gradient-to-b from-lime2 to-lime text-bg shadow-[0_4px_20px_-4px_rgba(173,255,47,0.5)]"
                    : "border border-br2 bg-bg2/60 text-tx hover:border-tx3"
                }`}
              >
                {loadingPlan === p.id ? "Redirigiendo…" : p.cta}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

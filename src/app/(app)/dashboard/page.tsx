"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  Button,
  StatCard,
  StatusBadge,
  ProgressBar,
  EmptyState,
} from "@/components/ui/primitives";
import { useUser, useTournaments, useContacts } from "@/lib/data/use-store";
import { toast } from "@/components/ui/toast";
import { FORMAT_LABELS, STATUS_LABELS, isPadel } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const tournaments = useTournaments();
  const contacts = useContacts();

  // Resume a pending checkout the user kicked off before logging in.
  useEffect(() => {
    if (!user) return;
    if (typeof window === "undefined") return;
    const pending = sessionStorage.getItem("pendingCheckout");
    if (!pending) return;
    sessionStorage.removeItem("pendingCheckout");
    try {
      const { plan, billing } = JSON.parse(pending);
      (async () => {
        const r = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, billing }),
        });
        const data = await r.json();
        if (r.ok && data.url) window.location.assign(data.url);
      })();
    } catch {
      // ignore malformed pending checkout
    }
  }, [user]);

  // Toast feedback after returning from Stripe Checkout.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const sub = params.get("subscription");
    if (sub === "success") {
      toast("¡Suscripción activada! Bienvenido 🎉");
      window.history.replaceState({}, "", "/dashboard");
    } else if (sub === "cancel") {
      toast("Pago cancelado");
      window.history.replaceState({}, "", "/dashboard");
    }
  }, []);

  const liveCount = tournaments.filter((t) => t.status === "live").length;
  const totalTeams = tournaments.reduce(
    (sum, t) => sum + (t.teams?.length ?? 0),
    0,
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-7">
        <p className="font-mono text-xs uppercase tracking-widest text-tx3">
          Dashboard
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Hola, {user?.name?.split(" ")[0] ?? "organizador"} 👋
        </h1>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Torneos" value={tournaments.length} />
        <StatCard
          label="En vivo"
          value={liveCount}
          accent={liveCount ? "var(--color-red)" : "var(--color-tx3)"}
        />
        <StatCard label="Parejas" value={totalTeams} accent="var(--color-blue)" />
        <StatCard
          label="Contactos"
          value={contacts.length}
          accent="var(--color-orange)"
        />
      </div>

      {/* Próximamente: asistente IA */}
      <div className="surface relative mb-7 overflow-hidden rounded-card p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-lime/15 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-soft bg-lime/10 text-2xl ring-1 ring-inset ring-lime/25">
            🤖
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold">Asistente con IA</h3>
              <span className="rounded-full bg-lime/15 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-lime ring-1 ring-inset ring-lime/30">
                PRONTO
              </span>
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-tx2">
              Habla con Tournex en español: <em>“mueve a Pérez a 2da”</em>,{" "}
              <em>“anota 6-4”</em>, <em>“¿quién va líder?”</em> — la IA ejecuta
              los cambios. <span className="text-lime">Incluido gratis para ti</span> como suscriptor temprano.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-bold">Mis Torneos</h2>
        <Link href="/tournament/new">
          <Button size="sm">+ Nuevo torneo</Button>
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <Card>
          <EmptyState
            icon="🏆"
            title="Sin torneos todavía"
            body="Crea tu primer torneo de pádel en menos de 5 minutos."
            action={
              <Link href="/tournament/new">
                <Button>Crear torneo →</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tournaments.map((t) => {
            const teamCount = t.teams?.length ?? 0;
            const pct = t.maxPairs
              ? Math.round((teamCount / t.maxPairs) * 100)
              : 0;
            return (
              <Card
                key={t.id}
                onClick={() => router.push(`/tournament/${t.id}`)}
                className="p-5"
              >
                <div className="flex items-start justify-between">
                  <StatusBadge
                    status={t.status}
                    label={STATUS_LABELS[t.status] ?? t.status}
                  />
                  <span className="text-tx3 transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </div>
                <div className="mt-3 text-lg font-bold leading-snug">
                  {t.name}
                </div>
                <div className="mt-1 text-[13px] text-tx3">
                  {t.sport} · {FORMAT_LABELS[t.format] ?? t.format}
                </div>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-tx2">
                  <span className="flex items-center gap-1">
                    👥 {teamCount}
                    {t.maxPairs ? `/${t.maxPairs}` : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    🏟️ {t.courts} {isPadel(t.sport) ? "pistas" : "canchas"}
                  </span>
                  {t.price ? (
                    <span className="flex items-center gap-1">
                      💰 ${t.price}
                    </span>
                  ) : null}
                </div>
                {t.maxPairs ? (
                  <div className="mt-4">
                    <ProgressBar pct={pct} />
                    <div className="mt-1.5 font-mono text-[11px] text-tx3">
                      {pct}% del cupo
                    </div>
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

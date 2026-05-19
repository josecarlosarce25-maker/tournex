// Tournament detail screen: header with actions + tabbed panels.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, StatusBadge } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";
import { useTournament, store } from "@/lib/data/use-store";
import { FORMAT_LABELS, STATUS_LABELS, isPadel } from "@/lib/utils";
import {
  TeamsTab,
  BracketsTab,
  ScheduleTab,
  ControlTab,
  JornadasTab,
  PlayerTab,
  ShareTab,
} from "./tabs";

type TabId =
  | "teams"
  | "brackets"
  | "jornadas"
  | "schedule"
  | "control"
  | "player"
  | "share";

export function TournamentDetail({ id }: { id: string }) {
  const router = useRouter();
  const t = useTournament(id);
  const [tab, setTab] = useState<TabId>("teams");
  // True while any header action (Generar, Iniciar, Terminar, Eliminar) is
  // in flight — disables the buttons to prevent double-clicks.
  const [busy, setBusy] = useState(false);

  async function withBusy<T>(label: string, fn: () => Promise<T>) {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      toast(`Error en ${label}`, "error");
    } finally {
      setBusy(false);
    }
  }

  if (!t) {
    return (
      <div className="py-20 text-center text-tx3">
        Torneo no encontrado.{" "}
        <button
          onClick={() => router.push("/dashboard")}
          className="text-lime underline"
        >
          Volver al dashboard
        </button>
      </div>
    );
  }

  const isLiga = t.format === "liga_semanal";
  const hasEngine = !!(t.brackets || t.groups || t.jornadas);
  const padel = isPadel(t.sport);

  const allTabs: { id: TabId; label: string }[] = isLiga
    ? [
        { id: "teams", label: `👥 ${padel ? "Parejas" : "Equipos"}` },
        { id: "jornadas", label: "📅 Jornadas" },
        { id: "player", label: "📱 Jugador" },
        { id: "share", label: "🔗 Compartir" },
      ]
    : [
        { id: "teams", label: `👥 ${padel ? "Parejas" : "Equipos"}` },
        { id: "brackets", label: "🏆 Brackets" },
        { id: "schedule", label: "📅 Horarios" },
        { id: "control", label: "🖥️ Control" },
        { id: "player", label: "📱 Jugador" },
        { id: "share", label: "🔗 Compartir" },
      ];

  const activeTab = allTabs.some((x) => x.id === tab) ? tab : "teams";

  async function generate() {
    await withBusy("generar brackets", async () => {
      const r = await store.generateBrackets(t!.id);
      if (r.ok) {
        toast("Brackets generados ⚡");
        setTab(isLiga ? "jornadas" : "brackets");
      } else {
        toast(r.error ?? "Error", "error");
      }
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="surface mb-6 rounded-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{t.name}</h1>
              <StatusBadge
                status={t.status}
                label={STATUS_LABELS[t.status] ?? t.status}
              />
            </div>
            <p className="text-sm text-tx3">
              {t.sport} · {t.location ?? "—"} · {t.date ?? "—"} ·{" "}
              {FORMAT_LABELS[t.format] ?? t.format}
              {t.consolation ? " · +Consolación" : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setTab("share")}>
              🔗 Compartir
            </Button>
            {!hasEngine && (
              <Button size="sm" onClick={generate} disabled={busy}>
                {busy ? "Generando…" : "⚡ Generar brackets"}
              </Button>
            )}
            {hasEngine && t.status !== "live" && t.status !== "done" && (
              <Button
                size="sm"
                disabled={busy}
                onClick={() =>
                  withBusy("iniciar", async () => {
                    await store.setStatus(t.id, "live");
                    toast("🔴 Torneo en vivo");
                  })
                }
              >
                {busy ? "Iniciando…" : "🔴 Iniciar"}
              </Button>
            )}
            {t.status === "live" && (
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() =>
                  withBusy("terminar", async () => {
                    await store.setStatus(t.id, "done");
                    toast("✅ Torneo terminado");
                  })
                }
              >
                {busy ? "Terminando…" : "✅ Terminar"}
              </Button>
            )}
            <Button
              variant="danger"
              size="sm"
              disabled={busy}
              onClick={() => {
                if (confirm(`¿Eliminar "${t.name}"? No se puede deshacer.`)) {
                  void withBusy("eliminar", async () => {
                    await store.deleteTournament(t.id);
                    toast("Torneo eliminado");
                    router.push("/dashboard");
                  });
                }
              }}
            >
              🗑️
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-0 overflow-x-auto border-b border-hair">
        {allTabs.map((x) => (
          <button
            key={x.id}
            onClick={() => setTab(x.id)}
            className={`-mb-px whitespace-nowrap border-b-2 px-5 py-3 text-sm font-medium transition-colors ${
              activeTab === x.id
                ? "border-lime text-lime"
                : "border-transparent text-tx3 hover:text-tx"
            }`}
          >
            {x.label}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="animate-fade-up" key={activeTab}>
        {activeTab === "teams" && <TeamsTab t={t} />}
        {activeTab === "brackets" && <BracketsTab t={t} />}
        {activeTab === "jornadas" && <JornadasTab t={t} />}
        {activeTab === "schedule" && <ScheduleTab t={t} />}
        {activeTab === "control" && <ControlTab t={t} />}
        {activeTab === "player" && <PlayerTab t={t} />}
        {activeTab === "share" && <ShareTab t={t} />}
      </div>
    </div>
  );
}

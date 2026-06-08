// Tournament detail screen: header with actions + tabbed panels.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  StatusBadge,
  Modal,
  ConfirmDialog,
  Field,
  Input,
  Select,
} from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";
import { useTournament, store } from "@/lib/data/use-store";
import { FORMAT_LABELS, STATUS_LABELS, isPadel, MEXICAN_STATES } from "@/lib/utils";
import type { Tournament } from "@/lib/types";
import {
  TeamsTab,
  BracketsTab,
  ScheduleTab,
  ControlTab,
  JornadasTab,
  PlayerTab,
  ShareTab,
} from "./tabs";
import { AssistantChat } from "./assistant-chat";

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
  const [editingInfo, setEditingInfo] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function withBusy<T>(label: string, fn: () => Promise<T>) {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
    } catch {
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingInfo(true)}
            >
              ✏️ Editar
            </Button>
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
                    // Feed results into the global ranking (fire-and-forget).
                    fetch("/api/rankings/process", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ tournamentId: t.id }),
                    })
                      .then((r) => r.json())
                      .then((d) => {
                        if (d.processed > 0)
                          toast(
                            `🏆 ${d.processed} partidos sumados al ranking`,
                          );
                      })
                      .catch(() => {});
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
              onClick={() => setConfirmDelete(true)}
            >
              🗑️
            </Button>
          </div>
        </div>
      </div>

      {/* Edit tournament info modal */}
      {editingInfo && (
        <EditTournamentModal
          tournament={t}
          onClose={() => setEditingInfo(false)}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() =>
          withBusy("eliminar", async () => {
            await store.deleteTournament(t.id);
            toast("Torneo eliminado");
            router.push("/dashboard");
          })
        }
        title="¿Eliminar torneo?"
        body={`Se borrará "${t.name}" con todas sus parejas y resultados. Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
      />

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

      {/* Floating AI assistant */}
      <AssistantChat tournament={t} />
    </div>
  );
}

/** Modal to edit a tournament's basic info. Keyed by id from the parent so
 *  initial state hydrates without an effect. */
function EditTournamentModal({
  tournament,
  onClose,
}: {
  tournament: Tournament;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: tournament.name,
    location: tournament.location ?? "",
    date: tournament.date ?? "",
    price: tournament.price != null ? String(tournament.price) : "",
    maxPairs: tournament.maxPairs != null ? String(tournament.maxPairs) : "",
    payLink: tournament.payLink ?? "",
    state: (tournament as { state?: string }).state ?? "",
    municipality: (tournament as { municipality?: string }).municipality ?? "",
  });
  const [saving, setSaving] = useState(false);
  const setF = (p: Partial<typeof form>) =>
    setForm((prev) => ({ ...prev, ...p }));

  async function save() {
    if (!form.name.trim()) {
      toast("El nombre no puede quedar vacío", "error");
      return;
    }
    setSaving(true);
    const r = await store.updateTournamentInfo(tournament.id, {
      name: form.name,
      location: form.location,
      date: form.date,
      price: form.price ? Number(form.price) : null,
      maxPairs: form.maxPairs ? Number(form.maxPairs) : null,
      payLink: form.payLink,
      state: form.state || null,
      municipality: form.municipality || null,
    });
    setSaving(false);
    if (!r.ok) {
      toast(r.error ?? "No se pudo guardar", "error");
      return;
    }
    toast("Torneo actualizado ✓");
    onClose();
  }

  return (
    <Modal open onClose={onClose} title="Editar torneo">
      <div className="grid gap-3.5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Nombre del torneo">
            <Input
              value={form.name}
              onChange={(e) => setF({ name: e.target.value })}
              placeholder="Copa Primavera 2026"
            />
          </Field>
        </div>
        <Field label="Sede / lugar">
          <Input
            value={form.location}
            onChange={(e) => setF({ location: e.target.value })}
            placeholder="Club Deportivo…"
          />
        </Field>
        <Field label="Fecha">
          <Input
            value={form.date}
            onChange={(e) => setF({ date: e.target.value })}
            placeholder="15 de junio"
          />
        </Field>
        <Field label="Estado (para el ranking)">
          <Select
            value={form.state}
            onChange={(e) => setF({ state: e.target.value })}
          >
            <option value="">— Selecciona —</option>
            {MEXICAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Municipio (opcional)">
          <Input
            value={form.municipality}
            onChange={(e) => setF({ municipality: e.target.value })}
            placeholder="Guadalajara"
          />
        </Field>
        <Field label="Costo de inscripción (MXN)">
          <Input
            type="number"
            value={form.price}
            onChange={(e) => setF({ price: e.target.value })}
            placeholder="500"
          />
        </Field>
        <Field label="Cupo máximo de parejas">
          <Input
            type="number"
            value={form.maxPairs}
            onChange={(e) => setF({ maxPairs: e.target.value })}
            placeholder="16"
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Link de pago (MercadoPago / transferencia)">
            <Input
              value={form.payLink}
              onChange={(e) => setF({ payLink: e.target.value })}
              placeholder="https://mpago.la/…"
            />
          </Field>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2.5">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancelar
        </Button>
        <Button size="sm" onClick={save} disabled={saving}>
          {saving ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </Modal>
  );
}

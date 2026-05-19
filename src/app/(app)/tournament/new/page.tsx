"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Button,
  Input,
  Select,
  Field,
  Label,
  Chip,
  ChipGroup,
  ChipMulti,
  ToggleRow,
} from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";
import { store } from "@/lib/data/use-store";
import { isPadel } from "@/lib/utils";
import type { TournamentFormat, ScoreFormat } from "@/lib/types";
import { SCORE_FORMAT_LABELS } from "@/lib/tournament/scoring";

const SPORTS = ["Pádel", "Tenis", "Fútbol", "Basquetbol", "Voleibol", "Otro"];
const RAMAS = ["Varonil", "Femenil", "Mixto"];
const FUERZAS = ["1ra", "2da", "3ra", "4ta", "5ta", "6ta"];
const SUMAS = ["Suma 6", "Suma 8", "Suma 10", "Suma 12"];

interface WizardState {
  name: string;
  sport: string;
  location: string;
  date: string;
  days: number;
  weeks: number;
  isLiga: boolean;
  format: TournamentFormat;
  scoreFormat: ScoreFormat;
  selectedRamas: string[];
  ramaCats: Record<string, string[]>;
  sumas: string[];
  genericCats: string[];
  consolation: boolean;
  courts: number;
  maxPairs: string;
  groupSize: number;
  minMatches: string;
  startTime: string;
  endTime: string;
  matchDuration: number;
  finalTime: string;
  deadStart: string;
  deadEnd: string;
  price: string;
  payLink: string;
  deadline: string;
  includesShirt: boolean;
}

const INITIAL: WizardState = {
  name: "",
  sport: "Pádel",
  location: "",
  date: "",
  days: 1,
  weeks: 8,
  isLiga: false,
  format: "round_robin",
  scoreFormat: "8games",
  selectedRamas: ["Varonil"],
  ramaCats: {},
  sumas: [],
  genericCats: ["Categoría A"],
  consolation: false,
  courts: 4,
  maxPairs: "",
  groupSize: 3,
  minMatches: "",
  startTime: "09:00",
  endTime: "20:00",
  matchDuration: 45,
  finalTime: "",
  deadStart: "",
  deadEnd: "",
  price: "",
  payLink: "",
  deadline: "",
  includesShirt: false,
};

const STEPS = [
  { n: 1, label: "Básico" },
  { n: 2, label: "Formato" },
  { n: 3, label: "Detalles" },
];

export default function WizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [d, setD] = useState<WizardState>(INITIAL);
  const set = (patch: Partial<WizardState>) =>
    setD((prev) => ({ ...prev, ...patch }));

  const padel = isPadel(d.sport);

  function computeCategories(): string[] {
    if (padel) {
      const cats: string[] = [];
      for (const rama of d.selectedRamas) {
        const fuerzas = d.ramaCats[rama] ?? [];
        if (fuerzas.length) {
          for (const f of fuerzas) cats.push(`${rama} ${f}`);
        } else {
          cats.push(rama);
        }
      }
      return [...cats, ...d.sumas];
    }
    return d.genericCats.map((c) => c.trim()).filter(Boolean);
  }

  function next() {
    if (step === 1 && !d.name.trim()) {
      toast("El nombre del torneo es obligatorio", "error");
      return;
    }
    setStep((s) => Math.min(3, s + 1));
  }

  const [saving, setSaving] = useState(false);
  async function finish() {
    const categories = computeCategories();
    if (!categories.length) {
      toast("Agrega al menos una categoría", "error");
      return;
    }
    setSaving(true);
    const r = await store.createTournament({
      name: d.name.trim(),
      sport: d.sport,
      location: d.location.trim() || undefined,
      date: d.date || undefined,
      days: d.days,
      weeks: d.weeks,
      isLiga: d.isLiga,
      format: d.isLiga ? "liga_semanal" : d.format,
      scoreFormat: d.scoreFormat,
      categories,
      consolation: d.consolation,
      courts: d.courts,
      maxPairs: d.maxPairs ? Number(d.maxPairs) : undefined,
      groupSize: d.groupSize,
      minMatches: d.minMatches ? Number(d.minMatches) : undefined,
      startTime: d.startTime,
      endTime: d.endTime,
      matchDuration: d.matchDuration,
      finalTime: d.finalTime || undefined,
      deadStart: d.deadStart || undefined,
      deadEnd: d.deadEnd || undefined,
      price: d.price ? Number(d.price) : undefined,
      payLink: d.payLink.trim() || undefined,
      deadline: d.deadline || undefined,
      includesShirt: d.includesShirt,
    });
    setSaving(false);
    if (!r.ok || !r.tournament) {
      toast(r.error ?? "No se pudo crear el torneo", "error");
      return;
    }
    toast("Torneo creado ⚡");
    router.push(`/tournament/${r.tournament.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-widest text-tx3">
        Nuevo torneo
      </p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">Crear Torneo</h1>
      <p className="mt-1 mb-7 text-sm text-tx3">
        Configura tu torneo en 3 pasos simples
      </p>

      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center">
        {STEPS.map((s, i) => (
          <div key={s.n} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-mono text-sm font-bold transition-all duration-300 ${
                  s.n <= step
                    ? "bg-gradient-to-b from-lime2 to-lime text-bg shadow-[0_0_18px_-3px_rgba(173,255,47,0.6)]"
                    : "bg-bg3 text-tx3 ring-1 ring-inset ring-hair"
                }`}
              >
                {s.n < step ? "✓" : s.n}
              </div>
              <span
                className={`text-xs font-semibold transition-colors ${
                  s.n <= step ? "text-tx" : "text-tx3"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < 2 && (
              <div
                className={`mx-2 mb-6 h-0.5 w-16 rounded-full transition-colors duration-300 ${
                  s.n < step ? "bg-lime" : "bg-br2"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card className="p-6">
        {step === 1 && <Step1 d={d} set={set} />}
        {step === 2 && <Step2 d={d} set={set} setD={setD} padel={padel} />}
        {step === 3 && <Step3 d={d} set={set} padel={padel} />}
      </Card>

      <div className="mt-6 flex justify-between">
        {step > 1 ? (
          <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
            ← Anterior
          </Button>
        ) : (
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Cancelar
          </Button>
        )}
        {step < 3 ? (
          <Button onClick={next}>Siguiente →</Button>
        ) : (
          <Button onClick={finish} disabled={saving}>
            {saving ? "Creando…" : "Crear torneo →"}
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Step 1 ───────────────────────────────────────────────────

function Step1({
  d,
  set,
}: {
  d: WizardState;
  set: (p: Partial<WizardState>) => void;
}) {
  return (
    <div>
      <Field label="Nombre del torneo *">
        <Input
          value={d.name}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="Ej: Victory Pádel Open 2026"
        />
      </Field>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Deporte">
          <Select
            value={d.sport}
            onChange={(e) => set({ sport: e.target.value })}
          >
            {SPORTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="Lugar / Sede">
          <Input
            value={d.location}
            onChange={(e) => set({ location: e.target.value })}
            placeholder="Ej: Club Pádel Zapopan"
          />
        </Field>
      </div>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Fecha de inicio">
          <Input
            type="date"
            value={d.date}
            onChange={(e) => set({ date: e.target.value })}
          />
        </Field>
        {d.isLiga ? (
          <Field label="Duración (semanas/jornadas)">
            <Input
              type="number"
              min={1}
              max={52}
              value={d.weeks}
              onChange={(e) => set({ weeks: Number(e.target.value) })}
            />
          </Field>
        ) : (
          <Field label="Duración (días)">
            <Input
              type="number"
              min={1}
              max={7}
              value={d.days}
              onChange={(e) => set({ days: Number(e.target.value) })}
            />
          </Field>
        )}
      </div>
      <div className="mt-2 rounded-soft bg-bg3 p-4">
        <ToggleRow
          label="¿Es una liga?"
          sub="Varias jornadas a lo largo del tiempo, con ascensos y descensos"
          checked={d.isLiga}
          onChange={(v) =>
            set({ isLiga: v, format: v ? "liga_semanal" : "round_robin" })
          }
        />
      </div>
    </div>
  );
}

// ── Step 2 ───────────────────────────────────────────────────

function Step2({
  d,
  set,
  setD,
  padel,
}: {
  d: WizardState;
  set: (p: Partial<WizardState>) => void;
  setD: React.Dispatch<React.SetStateAction<WizardState>>;
  padel: boolean;
}) {
  // Functional update — safe even if the user clicks several chips quickly.
  const toggleRamaFuerza = (rama: string, fuerza: string) => {
    setD((prev) => {
      const current = prev.ramaCats[rama] ?? [];
      const updated = current.includes(fuerza)
        ? current.filter((f) => f !== fuerza)
        : [...current, fuerza];
      return { ...prev, ramaCats: { ...prev.ramaCats, [rama]: updated } };
    });
  };

  return (
    <div>
      {d.isLiga ? (
        <Field label="Formato">
          <div className="rounded-soft border border-lime/30 bg-lime/5 px-4 py-3 text-sm text-lime">
            Liga semanal — los jugadores rotan de pista según ganen o pierdan.
          </div>
        </Field>
      ) : (
        <Field label="Formato">
          <ChipGroup
            value={d.format}
            onChange={(format) => set({ format })}
            options={[
              { value: "round_robin", label: "Americano (todos contra todos)" },
              { value: "elimination", label: "Eliminación directa" },
              { value: "groups_elim", label: "Grupos + Eliminación" },
            ]}
          />
        </Field>
      )}

      <div className="my-5 h-px bg-hair" />

      <Field label="Formato de puntuación">
        <ChipGroup
          value={d.scoreFormat}
          onChange={(scoreFormat) => set({ scoreFormat })}
          options={(
            Object.keys(SCORE_FORMAT_LABELS) as ScoreFormat[]
          ).map((k) => ({ value: k, label: SCORE_FORMAT_LABELS[k] }))}
        />
      </Field>

      <div className="my-5 h-px bg-hair" />

      {padel ? (
        <>
          <Field
            label="Rama"
            hint="Selecciona una o varias — cada una tiene sus propias fuerzas"
          >
            <ChipMulti
              options={RAMAS}
              values={d.selectedRamas}
              onChange={(selectedRamas) => set({ selectedRamas })}
            />
          </Field>
          {d.selectedRamas.map((rama) => (
            <div
              key={rama}
              className="mt-3 rounded-soft border border-br bg-bg p-3.5"
            >
              <p className="mb-2 text-[13px] font-semibold text-lime">
                {rama} — Fuerzas
              </p>
              <div className="flex flex-wrap gap-2">
                {FUERZAS.map((f) => (
                  <Chip
                    key={f}
                    selected={(d.ramaCats[rama] ?? []).includes(f)}
                    onClick={() => toggleRamaFuerza(rama, f)}
                  >
                    {f}
                  </Chip>
                ))}
              </div>
            </div>
          ))}
          <div className="mt-4">
            <Label tip="Común en pádel: la suma del nivel de ambos jugadores">
              Suma de categorías
            </Label>
            <ChipMulti
              options={SUMAS}
              values={d.sumas}
              onChange={(sumas) => set({ sumas })}
            />
          </div>
        </>
      ) : (
        <Field label="Categorías">
          <div className="flex flex-col gap-2">
            {d.genericCats.map((cat, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 rounded-soft border border-br bg-bg px-3.5 py-2.5"
              >
                <input
                  className="flex-1 bg-transparent text-sm text-tx outline-none placeholder:text-tx3"
                  value={cat}
                  placeholder="Nombre de la categoría"
                  onChange={(e) => {
                    const value = e.target.value;
                    setD((prev) => {
                      const copy = [...prev.genericCats];
                      copy[i] = value;
                      return { ...prev, genericCats: copy };
                    });
                  }}
                />
                {d.genericCats.length > 1 && (
                  <button
                    onClick={() =>
                      setD((prev) => ({
                        ...prev,
                        genericCats: prev.genericCats.filter(
                          (_, idx) => idx !== i,
                        ),
                      }))
                    }
                    className="text-tx3 hover:text-red"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() =>
              setD((prev) => ({
                ...prev,
                genericCats: [...prev.genericCats, ""],
              }))
            }
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-soft border border-dashed border-br2 py-2.5 text-[13px] text-tx3 transition-colors hover:border-lime hover:text-lime"
          >
            + Categoría
          </button>
        </Field>
      )}

      {!d.isLiga && d.format === "elimination" && (
        <>
          <div className="my-5 h-px bg-hair" />
          <ToggleRow
            label="Torneo de consolación"
            sub="Los eliminados en la primera ronda juegan un cuadro aparte"
            checked={d.consolation}
            onChange={(consolation) => set({ consolation })}
          />
        </>
      )}
    </div>
  );
}

// ── Step 3 ───────────────────────────────────────────────────

function Step3({
  d,
  set,
  padel,
}: {
  d: WizardState;
  set: (p: Partial<WizardState>) => void;
  padel: boolean;
}) {
  // Show the user how many matches each pair is guaranteed to play with the
  // format they picked in step 2 — this is what they actually promise players.
  const guarantee = (() => {
    if (d.isLiga) return `${d.groupSize - 1} por jornada · ${d.weeks} jornadas`;
    if (d.format === "round_robin")
      return "N − 1 (todos contra todos en su categoría)";
    if (d.format === "elimination")
      return d.consolation ? "2 partidos (con consolación)" : "1 partido mínimo";
    if (d.format === "groups_elim")
      return `${Math.max(1, d.groupSize - 1)} en fase de grupos + clasificatorio`;
    return "—";
  })();
  return (
    <div>
      <div className="mb-4 rounded-soft border border-lime/20 bg-lime/[0.04] p-3.5 text-[13px]">
        <div className="font-mono text-[10px] uppercase tracking-widest text-lime">
          Partidos garantizados por pareja
        </div>
        <div className="mt-0.5 font-semibold text-tx">{guarantee}</div>
        <div className="mt-1 text-[11px] text-tx3">
          Calculado a partir del formato y la configuración que elegiste.
        </div>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label={padel ? "Pistas disponibles" : "Canchas disponibles"}>
          <Input
            type="number"
            min={1}
            value={d.courts}
            onChange={(e) => set({ courts: Number(e.target.value) })}
          />
        </Field>
        <Field
          label="Máximo de parejas"
          tip="Cupo límite. Muestra el progreso de inscripción."
        >
          <Input
            type="number"
            value={d.maxPairs}
            onChange={(e) => set({ maxPairs: e.target.value })}
            placeholder="24"
          />
        </Field>
      </div>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field
          label="Parejas por grupo / pista"
          tip="En pádel suele ser 3 (2 partidos c/u) o 4 (3 partidos c/u)"
        >
          <Input
            type="number"
            min={3}
            max={8}
            value={d.groupSize}
            onChange={(e) => set({ groupSize: Number(e.target.value) })}
          />
        </Field>
        <Field
          label="Mín. partidos garantizados"
          tip="Partidos mínimos que cada pareja jugará"
        >
          <Input
            type="number"
            value={d.minMatches}
            onChange={(e) => set({ minMatches: e.target.value })}
            placeholder="3"
          />
        </Field>
      </div>

      <div className="my-5 h-px bg-hair" />

      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Inicio primera ronda">
          <Input
            type="time"
            value={d.startTime}
            onChange={(e) => set({ startTime: e.target.value })}
          />
        </Field>
        <Field label="Fin última ronda" tip="Hora máxima de partidos">
          <Input
            type="time"
            value={d.endTime}
            onChange={(e) => set({ endTime: e.target.value })}
          />
        </Field>
      </div>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field
          label="Duración por partido (min)"
          tip="Incluye el calentamiento"
        >
          <Input
            type="number"
            min={15}
            value={d.matchDuration}
            onChange={(e) => set({ matchDuration: Number(e.target.value) })}
          />
        </Field>
        <Field label="Hora preferida de final">
          <Input
            type="time"
            value={d.finalTime}
            onChange={(e) => set({ finalTime: e.target.value })}
          />
        </Field>
      </div>

      <div className="my-5 h-px bg-hair" />
      <p className="mb-2 text-[13px] font-semibold text-tx2">
        Tiempos muertos{" "}
        <span className="font-normal text-tx3">
          (ej. 12:00–16:00 sin partidos)
        </span>
      </p>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="De">
          <Input
            type="time"
            value={d.deadStart}
            onChange={(e) => set({ deadStart: e.target.value })}
          />
        </Field>
        <Field label="Hasta">
          <Input
            type="time"
            value={d.deadEnd}
            onChange={(e) => set({ deadEnd: e.target.value })}
          />
        </Field>
      </div>

      <div className="my-5 h-px bg-hair" />

      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Inscripción (MXN)">
          <Input
            type="number"
            value={d.price}
            onChange={(e) => set({ price: e.target.value })}
            placeholder="750"
          />
        </Field>
        <Field
          label="Link de pago (opcional)"
          tip="MercadoPago, transferencia, etc."
        >
          <Input
            value={d.payLink}
            onChange={(e) => set({ payLink: e.target.value })}
            placeholder="https://..."
          />
        </Field>
      </div>
      <Field label="Fecha límite de inscripción">
        <Input
          type="date"
          value={d.deadline}
          onChange={(e) => set({ deadline: e.target.value })}
        />
      </Field>

      <div className="my-5 h-px bg-hair" />
      <ToggleRow
        label="Incluye playera"
        sub="Se pedirá la talla a cada jugador al inscribirse"
        checked={d.includesShirt}
        onChange={(includesShirt) => set({ includesShirt })}
      />
    </div>
  );
}

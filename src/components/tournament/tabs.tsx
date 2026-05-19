// All the tab panels for the tournament detail screen.
"use client";

import { useState } from "react";
import {
  Card,
  Button,
  Input,
  Select,
  Field,
  Badge,
  Avatar,
  ProgressBar,
  EmptyState,
  CopyField,
} from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";
import { ScoreInput } from "./score-input";
import { store } from "@/lib/data/use-store";
import type { Tournament, Match, Round, Team } from "@/lib/types";
import { isPlaceholder } from "@/lib/types";
import { initials, isPadel } from "@/lib/utils";
import { standings } from "@/lib/tournament/standings";
import { ligaStandings, jornadaComplete } from "@/lib/tournament/liga";
import { formatScoreLine } from "@/lib/tournament/scoring";

const SHIRT_SIZES = ["", "XS", "S", "M", "L", "XL", "XXL"];

function publicBase() {
  if (typeof window !== "undefined") return window.location.origin;
  return "https://tournex.app";
}

// ── Teams ────────────────────────────────────────────────────

export function TeamsTab({ t }: { t: Tournament }) {
  const padel = isPadel(t.sport);
  const word = padel ? "pareja" : "equipo";
  const teams = t.teams ?? [];
  const [form, setForm] = useState({
    player1Name: "",
    player1Phone: "",
    player2Name: "",
    player2Phone: "",
    category: t.categories[0] ?? "General",
    player1Email: "",
    player1ShirtSize: "",
    player2ShirtSize: "",
  });
  const setF = (p: Partial<typeof form>) =>
    setForm((prev) => ({ ...prev, ...p }));

  const pct = t.maxPairs
    ? Math.round((teams.length / t.maxPairs) * 100)
    : 0;

  const [registering, setRegistering] = useState(false);
  async function register() {
    setRegistering(true);
    const result = await store.addTeam(t.id, form);
    setRegistering(false);
    if (!result.ok) {
      toast(result.error ?? "No se pudo registrar", "error");
      return;
    }
    toast(`${word[0].toUpperCase()}${word.slice(1)} registrada ✓`);
    setForm({
      player1Name: "",
      player1Phone: "",
      player2Name: "",
      player2Phone: "",
      category: t.categories[0] ?? "General",
      player1Email: "",
      player1ShirtSize: "",
      player2ShirtSize: "",
    });
  }

  return (
    <div>
      {t.maxPairs ? (
        <div className="mb-5">
          <div className="mb-1.5 flex justify-between text-[13px]">
            <span className="text-tx2">
              {teams.length} de {t.maxPairs} {padel ? "parejas" : "equipos"}
            </span>
            <span className="font-semibold text-lime">{pct}%</span>
          </div>
          <ProgressBar pct={pct} />
        </div>
      ) : null}

      <Card className="mb-5 p-5">
        <p className="mb-3.5 text-sm font-semibold">Registrar {word}</p>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Jugador 1">
            <Input
              value={form.player1Name}
              onChange={(e) => setF({ player1Name: e.target.value })}
              placeholder="Nombre completo"
            />
          </Field>
          <Field label="WhatsApp J1">
            <Input
              value={form.player1Phone}
              onChange={(e) => setF({ player1Phone: e.target.value })}
              placeholder="33 1234 5678"
            />
          </Field>
          <Field label="Jugador 2">
            <Input
              value={form.player2Name}
              onChange={(e) => setF({ player2Name: e.target.value })}
              placeholder="Nombre completo"
            />
          </Field>
          <Field label="WhatsApp J2">
            <Input
              value={form.player2Phone}
              onChange={(e) => setF({ player2Phone: e.target.value })}
              placeholder="33 1234 5678"
            />
          </Field>
          <Field label="Categoría">
            <Select
              value={form.category}
              onChange={(e) => setF({ category: e.target.value })}
            >
              {t.categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Email (opcional)">
            <Input
              type="email"
              value={form.player1Email}
              onChange={(e) => setF({ player1Email: e.target.value })}
              placeholder="correo@email.com"
            />
          </Field>
          {t.includesShirt && (
            <>
              <Field label="Talla J1">
                <Select
                  value={form.player1ShirtSize}
                  onChange={(e) =>
                    setF({ player1ShirtSize: e.target.value })
                  }
                >
                  {SHIRT_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s || "—"}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Talla J2">
                <Select
                  value={form.player2ShirtSize}
                  onChange={(e) =>
                    setF({ player2ShirtSize: e.target.value })
                  }
                >
                  {SHIRT_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s || "—"}
                    </option>
                  ))}
                </Select>
              </Field>
            </>
          )}
        </div>
        <Button full onClick={register} disabled={registering}>
          {registering ? "Registrando…" : `+ Registrar ${word}`}
        </Button>
      </Card>

      {teams.length === 0 ? (
        <EmptyState icon="👥" title={`Sin ${padel ? "parejas" : "equipos"}`} />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-br text-left">
                <Th>#</Th>
                <Th>{padel ? "Pareja" : "Equipo"}</Th>
                <Th>WhatsApp</Th>
                <Th>Categoría</Th>
                <Th>Estado</Th>
                {t.includesShirt && <Th>Tallas</Th>}
                <Th> </Th>
              </tr>
            </thead>
            <tbody>
              {teams.map((tm, i) => (
                <tr key={tm.id} className="border-b border-br last:border-0">
                  <Td className="font-mono text-xs text-tx3">{i + 1}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <Avatar initials={initials(tm.name)} />
                      <div>
                        <div className="font-semibold">{tm.name}</div>
                        {tm.player1Email && (
                          <div className="text-[11px] text-tx3">
                            {tm.player1Email}
                          </div>
                        )}
                      </div>
                    </div>
                  </Td>
                  <Td className="text-xs text-tx3">
                    {tm.player1Phone || "—"}
                    {tm.player2Phone && (
                      <>
                        <br />
                        {tm.player2Phone}
                      </>
                    )}
                  </Td>
                  <Td>
                    <Badge>{tm.category}</Badge>
                  </Td>
                  <Td>
                    <select
                      value={tm.status}
                      onChange={(e) => {
                        void store.updateTeamStatus(
                          t.id,
                          tm.id,
                          e.target.value as Team["status"],
                        );
                      }}
                      className="rounded-md border border-br bg-bg px-2 py-1 text-xs text-tx2 outline-none"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="confirmed">Confirmada</option>
                      <option value="paid">Pagada</option>
                      <option value="cancelled">Cancelada</option>
                    </select>
                  </Td>
                  {t.includesShirt && (
                    <Td className="text-xs">
                      {tm.player1ShirtSize || "—"} /{" "}
                      {tm.player2ShirtSize || "—"}
                    </Td>
                  )}
                  <Td className="text-right">
                    <button
                      onClick={async () => {
                        await store.removeTeam(t.id, tm.id);
                        toast("Eliminada");
                      }}
                      className="rounded px-2 py-1 text-tx3 hover:bg-red/10 hover:text-red"
                    >
                      ✕
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3.5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-tx3">
      {children}
    </th>
  );
}

/** Pill-style category filter. Shown only when a tournament has >1 category. */
function CategoryFilter({
  categories,
  value,
  onChange,
}: {
  categories: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[12px]">
      <span className="mr-1 font-mono text-[10px] uppercase tracking-widest text-tx3">
        Filtrar:
      </span>
      <FilterPill active={value === "all"} onClick={() => onChange("all")}>
        Todas
      </FilterPill>
      {categories.map((c) => (
        <FilterPill key={c} active={value === c} onClick={() => onChange(c)}>
          {c}
        </FilterPill>
      ))}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
        active
          ? "bg-lime/12 text-lime ring-1 ring-inset ring-lime/30"
          : "bg-bg3 text-tx3 ring-1 ring-inset ring-hair hover:text-tx"
      }`}
    >
      {children}
    </button>
  );
}
function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-3.5 py-3 text-sm ${className}`}>{children}</td>;
}

// ── Brackets ─────────────────────────────────────────────────

export function BracketsTab({ t }: { t: Tournament }) {
  if (!t.brackets && !t.groups) {
    return (
      <EmptyState
        icon="🏆"
        title="Sin brackets todavía"
        body={`Registra ${isPadel(t.sport) ? "parejas" : "equipos"} y genera los brackets desde el botón de arriba.`}
      />
    );
  }

  if (t.format === "groups_elim" && t.groups) {
    return (
      <div className="space-y-6">
        {t.categories.map((cat) => {
          const catGroups = t.groups!.filter((g) => g.category === cat);
          if (!catGroups.length) return null;
          return (
            <div key={cat}>
              <h3 className="mb-3 font-mono text-sm font-bold text-lime">
                {cat}
              </h3>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {catGroups.map((g) => (
                  <Card key={g.name} className="overflow-hidden">
                    <div className="bg-bg3 px-4 py-3 font-mono text-sm font-bold text-lime">
                      {g.name}
                    </div>
                    <StandingsTable
                      rows={standings(g.teams, g.rounds)}
                      compact
                    />
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (t.format === "round_robin" && t.brackets) {
    return (
      <div className="space-y-6">
        {t.brackets.map((b) => (
          <div key={b.category}>
            <h3 className="mb-3 font-mono text-sm font-bold text-lime">
              {b.category}
            </h3>
            <Card className="overflow-x-auto">
              <StandingsTable rows={standings(b.teams, b.rounds)} />
            </Card>
          </div>
        ))}
      </div>
    );
  }

  if (t.format === "elimination" && t.brackets) {
    return (
      <div className="space-y-8">
        {t.brackets.map((b) => (
          <div key={b.category}>
            <h3 className="mb-3 font-mono text-sm font-bold text-lime">
              {b.category}
            </h3>
            <BracketView rounds={b.rounds} />
            {b.consolationRounds && b.consolationRounds.length > 0 && (
              <>
                <h4 className="mt-6 mb-3 font-mono text-xs font-bold uppercase tracking-wide text-tx3">
                  Cuadro de consolación
                </h4>
                <BracketView rounds={b.consolationRounds} />
              </>
            )}
          </div>
        ))}
      </div>
    );
  }

  return null;
}

function StandingsTable({
  rows,
  compact = false,
}: {
  rows: ReturnType<typeof standings>;
  compact?: boolean;
}) {
  return (
    <table className="w-full border-collapse text-center text-[13px]">
      <thead>
        <tr className="bg-bg3 text-tx2">
          <th className="border border-br px-3 py-2 text-left">Pareja</th>
          <th className="border border-br px-2 py-2">PJ</th>
          <th className="border border-br px-2 py-2">G</th>
          <th className="border border-br px-2 py-2">P</th>
          {!compact && (
            <>
              <th className="border border-br px-2 py-2">GF</th>
              <th className="border border-br px-2 py-2">GC</th>
            </>
          )}
          <th className="border border-br px-2 py-2">Pts</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.team.id}>
            <td className="border border-br bg-bg3 px-3 py-2 text-left font-semibold">
              {r.team.name}
            </td>
            <td className="border border-br px-2 py-2">{r.played}</td>
            <td className="border border-br px-2 py-2">{r.won}</td>
            <td className="border border-br px-2 py-2">{r.lost}</td>
            {!compact && (
              <>
                <td className="border border-br px-2 py-2">{r.gamesFor}</td>
                <td className="border border-br px-2 py-2">
                  {r.gamesAgainst}
                </td>
              </>
            )}
            <td className="border border-br px-2 py-2 font-bold text-lime">
              {r.points}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BracketView({ rounds }: { rounds: Round[] }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-10">
        {rounds.map((r) => (
          <div key={r.number} className="flex min-w-[220px] flex-col gap-4">
            <div className="text-center font-mono text-xs font-bold uppercase tracking-wide text-tx3">
              {r.name ?? `Ronda ${r.number}`}
            </div>
            {r.matches.map((m) => (
              <div
                key={m.id}
                className="overflow-hidden rounded-soft border border-br bg-bg2"
              >
                <MatchRow match={m} side={1} />
                <MatchRow match={m} side={2} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchRow({ match, side }: { match: Match; side: 1 | 2 }) {
  const team = side === 1 ? match.team1 : match.team2;
  const score = side === 1 ? match.score1 : match.score2;
  const isBye = team.name === "BYE";
  const isWinner =
    match.winnerId != null &&
    !isPlaceholder(team) &&
    team.id === match.winnerId;
  return (
    <div
      className={`flex items-center justify-between border-b border-br px-3.5 py-2.5 text-[13px] last:border-0 ${
        isWinner ? "bg-lime/10 font-semibold text-lime" : ""
      } ${isBye ? "italic text-tx3" : ""}`}
    >
      <span>{team.name}</span>
      <span className="font-mono font-semibold">
        {score != null ? score : ""}
      </span>
    </div>
  );
}

// ── Schedule ─────────────────────────────────────────────────

export function ScheduleTab({ t }: { t: Tournament }) {
  const [filterCat, setFilterCat] = useState<string>("all");
  const rounds: { label: string; category: string; matches: Match[] }[] = [];
  if (t.format === "groups_elim" && t.groups) {
    for (const g of t.groups) {
      for (const r of g.rounds) {
        rounds.push({
          label: `${g.name} — Jornada ${r.number}`,
          category: g.category,
          matches: r.matches,
        });
      }
    }
  } else if (t.brackets) {
    for (const b of t.brackets) {
      for (const r of b.rounds) {
        rounds.push({
          label: `${b.category} — ${r.name ?? "Jornada " + r.number}`,
          category: b.category,
          matches: r.matches,
        });
      }
    }
  }

  if (!rounds.length) {
    return (
      <EmptyState
        icon="📅"
        title="Sin horarios"
        body="Genera los brackets para ver los horarios."
      />
    );
  }

  const filtered =
    filterCat === "all" ? rounds : rounds.filter((r) => r.category === filterCat);

  return (
    <div className="space-y-4">
      {t.categories.length > 1 && (
        <CategoryFilter
          categories={t.categories}
          value={filterCat}
          onChange={setFilterCat}
        />
      )}
      {t.deadStart && t.deadEnd && (
        <div className="rounded-soft border border-orange/20 bg-orange/10 px-3.5 py-2.5 text-[13px] text-orange">
          ⏸️ Tiempo muerto: {t.deadStart} — {t.deadEnd}
        </div>
      )}
      {filtered.map((r, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="flex justify-between bg-bg3 px-4 py-3 text-sm font-bold">
            <span>{r.label}</span>
            <span className="font-mono text-[13px] text-lime">
              {r.matches[0]?.scheduledTime ?? ""}
            </span>
          </div>
          <div className="grid gap-px bg-br sm:grid-cols-2 lg:grid-cols-3">
            {r.matches.map((m) => (
              <div key={m.id} className="flex flex-col gap-1.5 bg-bg2 p-3.5">
                <div className="font-mono text-[11px] font-bold uppercase tracking-wide text-tx3">
                  {m.court ?? "—"}
                </div>
                <div className="text-sm font-semibold">
                  {m.team1.name}{" "}
                  <span className="font-normal text-tx3">vs</span>{" "}
                  {m.team2.name}
                </div>
                <div
                  className={`text-[11px] font-semibold ${
                    m.status === "done" ? "text-green" : "text-tx3"
                  }`}
                >
                  {m.status === "done"
                    ? formatScoreLine(m.sets) || `${m.score1} - ${m.score2}`
                    : m.scheduledTime || "Pendiente"}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── Control ──────────────────────────────────────────────────

function collectMatches(t: Tournament): {
  match: Match;
  context: string;
  category: string;
}[] {
  const out: { match: Match; context: string; category: string }[] = [];
  if (t.format === "groups_elim" && t.groups) {
    for (const g of t.groups) {
      for (const r of g.rounds) {
        for (const m of r.matches) {
          out.push({
            match: m,
            context: `${g.name} · J${r.number}`,
            category: g.category,
          });
        }
      }
    }
  }
  for (const b of t.brackets ?? []) {
    for (const r of b.rounds) {
      for (const m of r.matches) {
        out.push({
          match: m,
          context: `${b.category} · ${r.name ?? "J" + r.number}`,
          category: b.category,
        });
      }
    }
    for (const r of b.consolationRounds ?? []) {
      for (const m of r.matches) {
        out.push({
          match: m,
          context: r.name ?? "Consolación",
          category: b.category,
        });
      }
    }
  }
  return out;
}

export function ControlTab({ t }: { t: Tournament }) {
  const [filterCat, setFilterCat] = useState<string>("all");
  if (!t.brackets && !t.groups) {
    return (
      <EmptyState
        icon="🖥️"
        title="Sin partidos"
        body="Genera los brackets para empezar a capturar resultados."
      />
    );
  }
  const allRaw = collectMatches(t);
  const all =
    filterCat === "all"
      ? allRaw
      : allRaw.filter((x) => x.category === filterCat);
  const pending = all.filter(
    (x) => x.match.status !== "done" && !readyBlocked(x.match),
  );
  const done = all.filter((x) => x.match.status === "done");

  return (
    <div>
      {t.categories.length > 1 && (
        <div className="mb-4">
          <CategoryFilter
            categories={t.categories}
            value={filterCat}
            onChange={setFilterCat}
          />
        </div>
      )}
      <h4 className="mb-4 text-sm font-bold text-tx2">
        Pendientes ({pending.length})
      </h4>
      {pending.length === 0 ? (
        <EmptyState icon="✅" title="Todos los partidos están capturados" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pending.map(({ match, context }) => (
            <Card key={match.id} className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-xs font-semibold uppercase text-lime">
                  {match.court ?? "—"}
                </span>
                <span className="text-[11px] text-tx3">{context}</span>
              </div>
              <div className="mb-2 space-y-1 text-sm font-semibold">
                <div>{match.team1.name}</div>
                <div className="text-tx3">vs</div>
                <div>{match.team2.name}</div>
              </div>
              <ScoreInput
                tournamentId={t.id}
                matchId={match.id}
                scoreFormat={t.scoreFormat}
                team1Name={match.team1.name}
                team2Name={match.team2.name}
              />
            </Card>
          ))}
        </div>
      )}

      {done.length > 0 && (
        <>
          <h4 className="mt-7 mb-4 text-sm font-bold text-tx2">
            Completados ({done.length})
          </h4>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {done.map(({ match, context }) => (
              <Card key={match.id} className="p-4 opacity-70">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold uppercase text-lime">
                    {match.court ?? "—"}
                  </span>
                  <span className="text-[11px] text-tx3">{context}</span>
                </div>
                <ScoreLine match={match} />
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** Hide elimination matches whose teams are still "Por definir". */
function readyBlocked(m: Match): boolean {
  return isPlaceholder(m.team1) || isPlaceholder(m.team2);
}

function ScoreLine({ match }: { match: Match }) {
  const w1 = (match.score1 ?? 0) > (match.score2 ?? 0);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-semibold">{match.team1.name}</span>
        <span
          className={`font-mono text-lg font-bold ${w1 ? "text-lime" : "text-tx3"}`}
        >
          {match.score1}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="font-semibold">{match.team2.name}</span>
        <span
          className={`font-mono text-lg font-bold ${!w1 ? "text-lime" : "text-tx3"}`}
        >
          {match.score2}
        </span>
      </div>
      {match.sets && match.sets.length > 1 && (
        <div className="pt-1 font-mono text-[11px] text-tx3">
          {formatScoreLine(match.sets)}
        </div>
      )}
    </div>
  );
}

// ── Jornadas (liga semanal) ──────────────────────────────────

export function JornadasTab({ t }: { t: Tournament }) {
  if (!t.jornadas || !t.jornadas.length) {
    return (
      <EmptyState
        icon="📅"
        title="Sin jornadas"
        body="Genera los brackets para crear la primera jornada."
      />
    );
  }
  const current = t.jornadas[(t.currentJornada ?? 1) - 1];
  const table = ligaStandings(t.teams ?? [], t.jornadas);
  const allDone = current ? jornadaComplete(current) : false;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h4 className="text-sm font-bold text-tx2">
          Jornada {t.currentJornada} de {t.jornadas.length}
        </h4>
        {t.jornadas.length > 1 && (
          <div className="flex gap-1">
            {t.jornadas.map((j) => (
              <button
                key={j.number}
                onClick={() => {
                  void store.setCurrentJornada(t.id, j.number);
                }}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                  j.number === t.currentJornada
                    ? "bg-lime text-bg"
                    : "border border-br text-tx2"
                }`}
              >
                {j.number}
              </button>
            ))}
          </div>
        )}
        {allDone && (
          <Button
            size="sm"
            onClick={async () => {
              const r = await store.advanceJornada(t.id);
              if (r.ok) toast("Siguiente jornada generada ↕");
              else toast(r.error ?? "Error", "error");
            }}
          >
            → Siguiente jornada
          </Button>
        )}
      </div>

      <div className="mb-6">
        <h4 className="mb-3 font-mono text-sm font-bold text-lime">
          TABLA GENERAL
        </h4>
        <Card className="overflow-x-auto">
          <table className="w-full border-collapse text-center text-[13px]">
            <thead>
              <tr className="bg-bg3 text-tx2">
                <th className="border border-br px-2 py-2">#</th>
                <th className="border border-br px-3 py-2 text-left">
                  Jugador
                </th>
                <th className="border border-br px-2 py-2">J</th>
                <th className="border border-br px-2 py-2">G</th>
                <th className="border border-br px-2 py-2">P</th>
                <th className="border border-br px-2 py-2">Pts</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row, i) => (
                <tr key={row.team.id}>
                  <td
                    className={`border border-br px-2 py-2 font-bold ${i < 3 ? "text-lime" : "text-tx3"}`}
                  >
                    {i + 1}
                  </td>
                  <td className="border border-br bg-bg3 px-3 py-2 text-left font-semibold">
                    {row.team.name}
                  </td>
                  <td className="border border-br px-2 py-2">
                    {row.jornadasPlayed}
                  </td>
                  <td className="border border-br px-2 py-2">{row.won}</td>
                  <td className="border border-br px-2 py-2">{row.lost}</td>
                  <td className="border border-br px-2 py-2 font-bold text-lime">
                    {row.totalPoints}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {current && (
        <>
          <h4 className="mb-4 text-sm font-bold text-tx2">
            Partidos — Jornada {current.number}
          </h4>
          <div className="space-y-4">
            {current.courts.map((court) => (
              <Card key={court.name} className="overflow-hidden">
                <div className="bg-bg3 px-4 py-3 text-sm font-bold">
                  {court.name}
                  <span className="ml-2 font-normal text-tx3">
                    {court.teams.map((tm) => tm.name).join(" · ")}
                  </span>
                </div>
                <div className="grid gap-px bg-br md:grid-cols-2 xl:grid-cols-3">
                  {court.matches.map((m) => (
                    <div key={m.id} className="bg-bg2 p-3.5">
                      {m.status === "done" ? (
                        <ScoreLine match={m} />
                      ) : (
                        <>
                          <div className="mb-2 space-y-1 text-sm font-semibold">
                            <div>{m.team1.name}</div>
                            <div className="text-tx3">vs</div>
                            <div>{m.team2.name}</div>
                          </div>
                          <ScoreInput
                            tournamentId={t.id}
                            matchId={m.id}
                            scoreFormat={t.scoreFormat}
                            team1Name={m.team1.name}
                            team2Name={m.team2.name}
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Player preview ───────────────────────────────────────────

export function PlayerTab({ t }: { t: Tournament }) {
  const teams = t.teams ?? [];
  const [teamId, setTeamId] = useState(teams[0]?.id ?? "");

  if (!t.brackets && !t.groups && !t.jornadas) {
    return (
      <EmptyState
        icon="📱"
        title="Sin partidos"
        body="Genera los brackets para ver la experiencia del jugador."
      />
    );
  }
  if (!teams.length) {
    return <EmptyState icon="📱" title="Registra parejas primero" />;
  }

  const myMatches: Match[] = [];
  const visit = (m: Match) => {
    if (
      (!isPlaceholder(m.team1) && m.team1.id === teamId) ||
      (!isPlaceholder(m.team2) && m.team2.id === teamId)
    ) {
      myMatches.push(m);
    }
  };
  for (const b of t.brackets ?? []) {
    b.rounds.forEach((r) => r.matches.forEach(visit));
    b.consolationRounds?.forEach((r) => r.matches.forEach(visit));
  }
  for (const g of t.groups ?? []) g.rounds.forEach((r) => r.matches.forEach(visit));
  for (const j of t.jornadas ?? [])
    j.courts.forEach((c) => c.matches.forEach(visit));

  const next = myMatches.find((m) => m.status !== "done");

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-4">
        <Field label="Ver como">
          <Select value={teamId} onChange={(e) => setTeamId(e.target.value)}>
            {teams.map((tm) => (
              <option key={tm.id} value={tm.id}>
                {tm.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="mb-5 border-b border-br pb-5 text-center">
        <h3 className="text-xl font-bold">{t.name}</h3>
        <p className="text-[13px] text-tx3">
          {t.sport} · {t.location ?? ""}
        </p>
      </div>

      {next ? (
        <Card className="mb-4 border-lime/30 bg-lime/5 p-5">
          <div className="mb-2.5 font-mono text-[11px] font-bold uppercase tracking-wide text-lime">
            ▸ Próximo partido
          </div>
          <div className="mb-2 text-lg font-bold">
            {next.team1.name} vs {next.team2.name}
          </div>
          <div className="flex gap-4 text-[13px] text-tx2">
            <span>🕐 {next.scheduledTime ?? "—"}</span>
            <span>🏟️ {next.court ?? "—"}</span>
          </div>
        </Card>
      ) : (
        <p className="my-5 text-center font-semibold text-green">
          ✅ Sin partidos pendientes
        </p>
      )}

      <h4 className="mb-3 text-sm font-bold text-tx2">Tus partidos</h4>
      {myMatches.map((m) => (
        <Card
          key={m.id}
          className={`mb-2.5 p-3.5 ${m.status === "done" ? "opacity-60" : ""}`}
        >
          <div className="text-sm font-semibold">
            {m.team1.name} vs {m.team2.name}
          </div>
          <div className="text-xs text-tx3">
            {m.court ?? "—"} · {m.scheduledTime ?? "—"}
          </div>
          {m.status === "done" && (
            <div className="mt-1 font-mono text-[13px] font-semibold text-lime">
              {formatScoreLine(m.sets) || `${m.score1} - ${m.score2}`}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

// ── Share ────────────────────────────────────────────────────

export function ShareTab({ t }: { t: Tournament }) {
  const base = publicBase();
  const playerLink = `${base}/t/${t.slug}`;
  const regLink = `${base}/reg/${t.slug}`;
  const teamCount = t.teams?.length ?? 0;

  const whatsapp = [
    `🏆 *${t.name}*`,
    `📍 ${t.location ?? "Por confirmar"}`,
    `📅 ${t.date ?? "Por confirmar"}`,
    `💰 $${t.price ?? "—"} MXN`,
    t.payLink ? `💳 Paga aquí: ${t.payLink}` : null,
    "",
    `✅ Inscríbete: ${regLink}`,
    `📊 Resultados en vivo: ${playerLink}`,
    t.maxPairs
      ? `\n⚠️ Cupo limitado: ${t.maxPairs} parejas (${teamCount} inscritas)`
      : null,
  ]
    .filter((l) => l !== null)
    .join("\n");

  return (
    <div className="max-w-xl">
      <h4 className="text-sm font-bold">Link de inscripción</h4>
      <p className="mb-1 text-[13px] text-tx3">
        Mándalo por WhatsApp para que las parejas se registren solas.
      </p>
      <CopyField value={regLink} />

      <h4 className="mt-5 text-sm font-bold">Link de resultados</h4>
      <p className="mb-1 text-[13px] text-tx3">
        Aquí los jugadores ven brackets, horarios y resultados en vivo.
      </p>
      <CopyField value={playerLink} />

      <Card className="mt-6 p-5">
        <h4 className="mb-2 text-sm font-bold">📤 Mensaje para WhatsApp</h4>
        <pre className="whitespace-pre-wrap rounded-soft bg-bg p-3.5 font-sans text-[13px] leading-relaxed text-tx2">
          {whatsapp}
        </pre>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => {
            navigator.clipboard?.writeText(whatsapp);
            toast("Mensaje copiado");
          }}
        >
          Copiar mensaje
        </Button>
      </Card>

      <p className="mt-4 text-[12px] text-tx3">
        Los links ya funcionan desde cualquier dispositivo. Cuando despleguemos
        la app a Vercel (Etapa 4), tendrás un dominio público.
      </p>
    </div>
  );
}

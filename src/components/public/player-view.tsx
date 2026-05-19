// Public results view — /t/[slug]. No login required.
"use client";

import { useState, useEffect } from "react";
import { Logo } from "@/components/ui/logo";
import { Card, Input, StatusBadge, EmptyState } from "@/components/ui/primitives";
import { PublicShell, NotFoundCard } from "./public-shell";
import { store } from "@/lib/data/use-store";
import type { Tournament, Match } from "@/lib/types";
import { isPlaceholder } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/utils";
import { formatScoreLine } from "@/lib/tournament/scoring";

interface MatchEntry {
  match: Match;
  category: string;
}

function allMatches(t: Tournament): MatchEntry[] {
  const out: MatchEntry[] = [];
  for (const b of t.brackets ?? []) {
    for (const r of b.rounds) {
      for (const m of r.matches) out.push({ match: m, category: b.category });
    }
    for (const r of b.consolationRounds ?? []) {
      for (const m of r.matches) out.push({ match: m, category: b.category });
    }
  }
  for (const g of t.groups ?? []) {
    for (const r of g.rounds) {
      for (const m of r.matches) out.push({ match: m, category: g.category });
    }
  }
  for (const j of t.jornadas ?? []) {
    for (const c of j.courts) {
      for (const m of c.matches) out.push({ match: m, category: "Liga" });
    }
  }
  return out;
}

export function PlayerView({ slug }: { slug: string }) {
  const [tournament, setTournament] = useState<
    Tournament | null | undefined
  >(undefined);
  const [query, setQuery] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const t = await store.getTournamentBySlug(slug);
      if (!cancelled) setTournament(t);
    }
    load();
    // Subscribe to live updates so resultados appear without refresh.
    // Unique suffix so React StrictMode's double-mount doesn't collide.
    const channelName = `public-t-${slug}-${Math.random().toString(36).slice(2, 8)}`;
    const channel = store.supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tournaments" },
        () => load(),
      )
      .subscribe();
    return () => {
      cancelled = true;
      store.supabase.removeChannel(channel);
    };
  }, [slug]);

  if (tournament === undefined) {
    return (
      <PublicShell>
        <p className="text-center text-tx3">Cargando…</p>
      </PublicShell>
    );
  }
  if (tournament === null) {
    return (
      <PublicShell>
        <NotFoundCard />
      </PublicShell>
    );
  }

  const t = tournament;
  const matches = allMatches(t);
  const q = query.trim().toLowerCase();

  // Apply both filters: category (chip) and search query.
  const byCategory =
    filterCat === "all"
      ? matches
      : matches.filter((m) => m.category === filterCat);
  const filtered = q
    ? byCategory.filter(
        ({ match }) =>
          match.team1.name.toLowerCase().includes(q) ||
          match.team2.name.toLowerCase().includes(q),
      )
    : byCategory;

  const nextForQuery = q
    ? filtered.find(({ match }) => match.status !== "done" && !blocked(match))
        ?.match
    : null;

  return (
    <PublicShell>
      <div className="mb-6 text-center">
        <div className="flex justify-center">
          <Logo size={40} />
        </div>
        <h1 className="mt-3 text-2xl font-bold">{t.name}</h1>
        <p className="mt-1 text-sm text-tx3">
          {t.sport} · {t.location ?? ""} · {t.date ?? ""}
        </p>
        <div className="mt-2">
          <StatusBadge
            status={t.status}
            label={STATUS_LABELS[t.status] ?? t.status}
          />
        </div>
      </div>

      <div className="mb-3">
        <Input
          placeholder="🔍 Busca tu nombre para ver tus partidos…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {t.categories.length > 1 && (
        <div className="mb-5 flex flex-wrap items-center gap-1.5 text-[12px]">
          <span className="mr-1 font-mono text-[10px] uppercase tracking-widest text-tx3">
            Categoría:
          </span>
          <button
            onClick={() => setFilterCat("all")}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              filterCat === "all"
                ? "bg-lime/12 text-lime ring-1 ring-inset ring-lime/30"
                : "bg-bg3 text-tx3 ring-1 ring-inset ring-hair hover:text-tx"
            }`}
          >
            Todas
          </button>
          {t.categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCat(c)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                filterCat === c
                  ? "bg-lime/12 text-lime ring-1 ring-inset ring-lime/30"
                  : "bg-bg3 text-tx3 ring-1 ring-inset ring-hair hover:text-tx"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {nextForQuery && (
        <Card className="mb-5 border-lime/30 bg-lime/5 p-5">
          <div className="mb-2 font-mono text-[11px] font-bold uppercase tracking-wide text-lime">
            ▸ Tu próximo partido
          </div>
          <div className="text-lg font-bold">
            {nextForQuery.team1.name} vs {nextForQuery.team2.name}
          </div>
          <div className="mt-1 flex gap-4 text-[13px] text-tx2">
            <span>🕐 {nextForQuery.scheduledTime ?? "—"}</span>
            <span>🏟️ {nextForQuery.court ?? "—"}</span>
          </div>
        </Card>
      )}

      {matches.length === 0 ? (
        <EmptyState
          icon="📅"
          title="El torneo aún no empieza"
          body="Cuando el organizador genere los brackets, aquí verás los partidos y resultados."
        />
      ) : (
        <div className="space-y-2.5">
          <h2 className="text-sm font-bold text-tx2">
            {q
              ? `Partidos de “${query}”`
              : filterCat === "all"
                ? "Todos los partidos"
                : `Partidos · ${filterCat}`}
          </h2>
          {filtered.length === 0 && (
            <p className="py-6 text-center text-sm text-tx3">
              Sin partidos {q ? `para “${query}”` : "en esta categoría"}.
            </p>
          )}
          {filtered.map(({ match: m, category }) => (
            <Card
              key={m.id}
              className="flex items-center justify-between p-3.5"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold">
                  <span className="text-white">{m.team1.name}</span>{" "}
                  <span className="text-tx3">vs</span>{" "}
                  <span className="text-lime">{m.team2.name}</span>
                </div>
                <div className="mt-0.5 text-[12px] text-tx3">
                  {category}
                  {m.court ? ` · ${m.court}` : ""}
                  {m.scheduledTime ? ` · ${m.scheduledTime}` : ""}
                  {m.roundName ? ` · ${m.roundName}` : ""}
                </div>
              </div>
              <div className="text-right">
                {m.status === "done" ? (
                  <div className="font-mono text-sm font-bold">
                    <span className="text-white">{m.score1}</span>
                    <span className="text-tx3"> - </span>
                    <span className="text-lime">{m.score2}</span>
                  </div>
                ) : (
                  <span className="text-[12px] text-tx3">Pendiente</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {t.payLink && t.status !== "done" && (
        <a href={t.payLink} target="_blank" rel="noopener noreferrer">
          <div className="mt-6 rounded-card border border-lime/30 bg-lime/5 p-4 text-center text-sm font-semibold text-lime">
            💳 Pagar inscripción
          </div>
        </a>
      )}
    </PublicShell>
  );
}

function blocked(m: Match): boolean {
  return isPlaceholder(m.team1) || isPlaceholder(m.team2);
}

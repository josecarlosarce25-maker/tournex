// Public ranking leaderboard with geo + search filters.
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { store } from "@/lib/data/use-store";
import type { Player } from "@/lib/types";

function ratingTier(rating: number): { label: string; color: string } {
  if (rating >= 1400) return { label: "Élite", color: "#ADFF2F" };
  if (rating >= 1250) return { label: "Avanzado", color: "#4DA6FF" };
  if (rating >= 1100) return { label: "Intermedio", color: "#FF9F43" };
  return { label: "Iniciante", color: "#A1A1AA" };
}

function medal(i: number): string {
  return i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "";
}

export function RankingBoard() {
  const [players, setPlayers] = useState<Player[] | null>(null);
  const [states, setStates] = useState<string[]>([]);
  const [state, setState] = useState<string>("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    store.listRankingStates().then(setStates);
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Show skeletons while the (debounced) query runs.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlayers(null);
    const id = setTimeout(() => {
      store
        .listRanking({ state: state || undefined, search: search || undefined })
        .then((p) => {
          if (!cancelled) setPlayers(p);
        });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [state, search]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      {/* Hero */}
      <div className="mb-7 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-lime">
          Ranking Tournex
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Los mejores del pádel
        </h1>
        <p className="mt-2 text-sm text-tx2">
          Cada torneo suma puntos. Sube de nivel, rétate y demuestra quién manda.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-2.5 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar jugador…"
          className="flex-1 rounded-soft border border-br2 bg-bg2 px-4 py-2.5 text-sm text-tx outline-none transition-colors focus:border-lime/40"
        />
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="rounded-soft border border-br2 bg-bg2 px-4 py-2.5 text-sm text-tx outline-none focus:border-lime/40"
        >
          <option value="">🇲🇽 Todo México</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Leaderboard */}
      {players === null ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-card bg-bg2"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      ) : players.length === 0 ? (
        <div className="surface rounded-card p-10 text-center">
          <div className="text-4xl">🎾</div>
          <h3 className="mt-3 font-bold">Aún no hay jugadores aquí</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-tx3">
            El ranking se llena cuando terminan los torneos. Organiza o juega uno
            y aparecerás aquí con tu nivel.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {players.map((p, i) => {
            const tier = ratingTier(p.rating);
            const top3 = i < 3;
            return (
              <Link
                key={p.id}
                href={`/player/${p.id}`}
                className={`group flex items-center gap-3 rounded-card p-3.5 transition-all hover:-translate-y-0.5 sm:gap-4 sm:p-4 ${
                  top3 ? "surface glow" : "surface"
                }`}
              >
                {/* Rank */}
                <div className="flex w-8 flex-shrink-0 items-center justify-center">
                  {medal(i) ? (
                    <span className="text-xl">{medal(i)}</span>
                  ) : (
                    <span className="font-mono text-sm font-bold text-tx3">
                      {i + 1}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ring-1 ring-inset"
                  style={{
                    backgroundColor: `${tier.color}1a`,
                    color: tier.color,
                    borderColor: `${tier.color}40`,
                  }}
                >
                  {p.displayName.slice(0, 1).toUpperCase()}
                </div>

                {/* Name + meta */}
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{p.displayName}</div>
                  <div className="flex items-center gap-2 text-[11px] text-tx3">
                    <span style={{ color: tier.color }}>{tier.label}</span>
                    {p.state && <span>· {p.state}</span>}
                    <span>
                      · {p.wins}V {p.losses}D
                    </span>
                    {p.currentStreak >= 3 && (
                      <span className="text-orange">🔥 {p.currentStreak}</span>
                    )}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex-shrink-0 text-right">
                  <div className="font-mono text-lg font-bold tabular-nums">
                    {p.rating}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-tx3">
                    pts
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <p className="mt-8 text-center text-[11px] text-tx3">
        El nivel se calcula con un sistema ELO: ganarle a parejas fuertes vale
        más. Juega torneos para subir.
      </p>
    </div>
  );
}

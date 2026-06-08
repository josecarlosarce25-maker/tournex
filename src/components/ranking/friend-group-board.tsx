// Public ranking of a single friend group (shared by link).
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { store } from "@/lib/data/use-store";
import type { FriendGroup, Player } from "@/lib/types";

function tierColor(rating: number): string {
  if (rating >= 1400) return "#ADFF2F";
  if (rating >= 1250) return "#4DA6FF";
  if (rating >= 1100) return "#FF9F43";
  return "#A1A1AA";
}

export function FriendGroupBoard({ slug }: { slug: string }) {
  const [data, setData] = useState<
    { group: FriendGroup; players: Player[] } | null | undefined
  >(undefined);

  useEffect(() => {
    let cancelled = false;
    store.getFriendGroupBySlug(slug).then((d) => {
      if (!cancelled) setData(d);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (data === undefined) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10">
        <div className="h-40 animate-pulse rounded-card bg-bg2" />
      </div>
    );
  }
  if (data === null) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center text-tx3">
        Grupo no encontrado.{" "}
        <Link href="/ranking" className="text-lime underline">
          Ver ranking general
        </Link>
      </div>
    );
  }

  const { group, players } = data;

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <div className="mb-7 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-lime">
          Ranking privado
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{group.name}</h1>
        <p className="mt-2 text-sm text-tx2">
          {players.length} {players.length === 1 ? "jugador" : "jugadores"} ·
          solo ustedes compiten aquí
        </p>
      </div>

      {players.length === 0 ? (
        <div className="surface rounded-card p-10 text-center">
          <div className="text-4xl">👥</div>
          <h3 className="mt-3 font-bold">Aún sin miembros</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-tx3">
            El dueño del grupo agrega jugadores desde su panel. Una vez que jueguen
            torneos, aquí verás su ranking.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {players.map((p, i) => {
            const color = tierColor(p.rating);
            return (
              <Link
                key={p.id}
                href={`/player/${p.id}`}
                className={`group flex items-center gap-4 rounded-card p-4 transition-all hover:-translate-y-0.5 ${
                  i === 0 ? "surface glow" : "surface"
                }`}
              >
                <div className="w-7 text-center font-mono text-sm font-bold text-tx3">
                  {i === 0 ? "👑" : i + 1}
                </div>
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ring-1 ring-inset"
                  style={{ backgroundColor: `${color}1a`, color, borderColor: `${color}40` }}
                >
                  {p.displayName.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{p.displayName}</div>
                  <div className="text-[11px] text-tx3">
                    {p.wins}V {p.losses}D
                    {p.currentStreak >= 3 ? ` · 🔥 ${p.currentStreak}` : ""}
                  </div>
                </div>
                <div className="text-right">
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

      <div className="mt-8 text-center">
        <Link href="/ranking" className="text-sm font-semibold text-tx3 underline hover:text-tx">
          Ver el ranking general de México →
        </Link>
      </div>
    </div>
  );
}

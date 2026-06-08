// Player profile: rating, level, record, rating evolution, partner chemistry,
// recent form. The shareable "FIFA card" of padel.
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { store } from "@/lib/data/use-store";
import { computeAnalytics, type PlayerAnalytics } from "@/lib/ranking/analytics";
import type { Player } from "@/lib/types";

function tierOf(rating: number): { label: string; color: string } {
  if (rating >= 1400) return { label: "Élite", color: "#ADFF2F" };
  if (rating >= 1250) return { label: "Avanzado", color: "#4DA6FF" };
  if (rating >= 1100) return { label: "Intermedio", color: "#FF9F43" };
  return { label: "Iniciante", color: "#A1A1AA" };
}

/** Tiny inline SVG sparkline of rating over time. */
function Sparkline({ points, color }: { points: number[]; color: string }) {
  if (points.length < 2) return null;
  const w = 280;
  const h = 60;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / range) * (h - 8) - 4;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-16 w-full">
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L${w},${h} L0,${h} Z`} fill="url(#spark)" />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlayerProfile({ playerId }: { playerId: string }) {
  const [player, setPlayer] = useState<Player | null | undefined>(undefined);
  const [analytics, setAnalytics] = useState<PlayerAnalytics | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const p = await store.getPlayer(playerId);
      if (cancelled) return;
      setPlayer(p);
      if (p) {
        const matches = await store.getPlayerMatches(playerId);
        if (!cancelled) setAnalytics(computeAnalytics(matches));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [playerId]);

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = player
      ? `${player.displayName} — nivel ${player.rating} en Tournex 🎾`
      : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: "Tournex", text, url });
      } catch {
        /* user cancelled */
      }
    } else {
      navigator.clipboard?.writeText(`${text} ${url}`);
    }
  }

  if (player === undefined) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10">
        <div className="h-48 animate-pulse rounded-card bg-bg2" />
      </div>
    );
  }
  if (player === null) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center text-tx3">
        Jugador no encontrado.{" "}
        <Link href="/ranking" className="text-lime underline">
          Ver ranking
        </Link>
      </div>
    );
  }

  const tier = tierOf(player.rating);

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      {/* Hero card */}
      <div className="surface glow relative overflow-hidden rounded-card p-6">
        <div
          className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full blur-3xl"
          style={{ backgroundColor: `${tier.color}26` }}
        />
        <div className="relative flex items-center gap-4">
          <div
            className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl text-2xl font-bold ring-1 ring-inset"
            style={{
              backgroundColor: `${tier.color}1a`,
              color: tier.color,
              borderColor: `${tier.color}40`,
            }}
          >
            {player.displayName.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold">{player.displayName}</h1>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[13px] text-tx2">
              <span
                className="rounded-full px-2 py-0.5 font-semibold"
                style={{ backgroundColor: `${tier.color}1a`, color: tier.color }}
              >
                {tier.label}
              </span>
              {player.state && <span>📍 {player.state}</span>}
            </div>
          </div>
          <button
            onClick={share}
            className="flex-shrink-0 rounded-soft border border-br2 bg-bg2 px-3 py-2 text-sm font-semibold text-tx transition-all hover:-translate-y-0.5 hover:border-tx3"
            aria-label="Compartir"
          >
            ↗
          </button>
        </div>

        {/* Big rating */}
        <div className="relative mt-6 flex items-end justify-between">
          <div>
            <div className="font-mono text-5xl font-bold tabular-nums" style={{ color: tier.color }}>
              {player.rating}
            </div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-tx3">
              nivel · pico {player.peakRating}
            </div>
          </div>
          {analytics && analytics.recentForm.length > 0 && (
            <div className="flex gap-1">
              {analytics.recentForm.map((w, i) => (
                <span
                  key={i}
                  className={`flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold ${
                    w
                      ? "bg-green/15 text-green ring-1 ring-inset ring-green/30"
                      : "bg-red/10 text-red ring-1 ring-inset ring-red/25"
                  }`}
                >
                  {w ? "V" : "D"}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stat tiles */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="Jugados" value={player.matchesPlayed} />
        <Stat label="Ganados" value={player.wins} accent="var(--color-green)" />
        <Stat
          label="% Victoria"
          value={analytics ? `${analytics.winRate}%` : "—"}
          accent="var(--color-lime)"
        />
      </div>

      {/* Rating evolution */}
      {analytics && analytics.ratingHistory.length >= 2 && (
        <div className="surface mt-4 rounded-card p-5">
          <h3 className="mb-3 text-sm font-bold">Evolución de tu nivel</h3>
          <Sparkline
            points={analytics.ratingHistory.map((r) => r.rating)}
            color={tier.color}
          />
        </div>
      )}

      {/* Partner chemistry — the unique, addictive part */}
      {analytics && analytics.partners.length > 0 && (
        <div className="surface mt-4 rounded-card p-5">
          <h3 className="mb-1 text-sm font-bold">Química de pareja</h3>
          <p className="mb-4 text-[12px] text-tx3">
            Con quién juegas mejor. Mínimo 2 partidos juntos para contar.
          </p>

          {analytics.bestPartner && (
            <div className="mb-3 flex items-center gap-3 rounded-soft bg-green/8 p-3 ring-1 ring-inset ring-green/20">
              <span className="text-xl">💚</span>
              <div className="flex-1">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-green">
                  Mejor dupla
                </div>
                <div className="font-semibold">{analytics.bestPartner.partnerName}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-lg font-bold text-green">
                  {analytics.bestPartner.winRate}%
                </div>
                <div className="text-[10px] text-tx3">
                  {analytics.bestPartner.won}/{analytics.bestPartner.played}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            {analytics.partners.map((p) => (
              <div
                key={p.partnerId}
                className="flex items-center gap-3 rounded-soft px-2 py-1.5"
              >
                <Link
                  href={`/player/${p.partnerId}`}
                  className="min-w-0 flex-1 truncate text-[13px] font-medium hover:text-lime"
                >
                  {p.partnerName}
                </Link>
                <span className="text-[11px] text-tx3">
                  {p.won}/{p.played}
                </span>
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-bg3">
                  <div
                    className="h-full rounded-full bg-lime"
                    style={{ width: `${p.winRate}%` }}
                  />
                </div>
                <span className="w-9 text-right font-mono text-[12px] font-bold tabular-nums">
                  {p.winRate}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {analytics && analytics.played === 0 && (
        <div className="surface mt-4 rounded-card p-8 text-center text-sm text-tx3">
          Todavía sin partidos contados. Cuando juegues un torneo, aquí verás tu
          historial y química de pareja.
        </div>
      )}

      <div className="mt-6 text-center">
        <Link
          href="/ranking"
          className="text-sm font-semibold text-tx3 underline transition-colors hover:text-tx"
        >
          ← Volver al ranking
        </Link>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="surface rounded-card p-4 text-center">
      <div
        className="font-mono text-2xl font-bold tabular-nums"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </div>
      <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-tx3">
        {label}
      </div>
    </div>
  );
}

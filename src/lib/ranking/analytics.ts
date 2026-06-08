// Derives a player's analytics from their match history.
// Pure functions — no I/O. Fed PlayerMatch[] from the store.

import type { PlayerMatch } from "@/lib/types";

export interface PartnerChemistry {
  partnerId: string;
  partnerName: string;
  played: number;
  won: number;
  winRate: number; // 0..100
}

export interface RatingPoint {
  index: number;
  rating: number;
}

export interface PlayerAnalytics {
  played: number;
  wins: number;
  losses: number;
  winRate: number; // 0..100
  bestPartner?: PartnerChemistry;
  worstPartner?: PartnerChemistry;
  partners: PartnerChemistry[];
  ratingHistory: RatingPoint[];
  recentForm: boolean[]; // most recent first, true = win
}

export function computeAnalytics(matches: PlayerMatch[]): PlayerAnalytics {
  const played = matches.length;
  const wins = matches.filter((m) => m.won).length;
  const losses = played - wins;
  const winRate = played ? Math.round((wins / played) * 100) : 0;

  // Partner chemistry.
  const byPartner = new Map<
    string,
    { name: string; played: number; won: number }
  >();
  for (const m of matches) {
    if (!m.partnerId) continue;
    const entry = byPartner.get(m.partnerId) ?? {
      name: m.partnerName ?? "Compañero",
      played: 0,
      won: 0,
    };
    entry.played += 1;
    if (m.won) entry.won += 1;
    byPartner.set(m.partnerId, entry);
  }
  const partners: PartnerChemistry[] = [...byPartner.entries()]
    .map(([partnerId, e]) => ({
      partnerId,
      partnerName: e.name,
      played: e.played,
      won: e.won,
      winRate: Math.round((e.won / e.played) * 100),
    }))
    .sort((a, b) => b.winRate - a.winRate || b.played - a.played);

  // Best/worst partner need at least 2 games together to be meaningful.
  const qualified = partners.filter((p) => p.played >= 2);
  const bestPartner = qualified[0];
  const worstPartner =
    qualified.length > 1 ? qualified[qualified.length - 1] : undefined;

  // Rating history (oldest → newest) for the sparkline.
  const chrono = [...matches].reverse();
  const ratingHistory: RatingPoint[] = chrono.map((m, i) => ({
    index: i,
    rating: m.ratingAfter,
  }));

  // Recent form: last 6 results, most recent first.
  const recentForm = matches.slice(0, 6).map((m) => m.won);

  return {
    played,
    wins,
    losses,
    winRate,
    bestPartner,
    worstPartner,
    partners,
    ratingHistory,
    recentForm,
  };
}

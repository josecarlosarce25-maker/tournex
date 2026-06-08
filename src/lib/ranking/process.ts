// Turns a finished tournament's results into ranking updates.
// Runs server-side with the service-role client (writes global players).
//
// Flow: load tournament engine + teams → extract played matches → find or
// create a persistent `player` per real person → replay matches in order,
// updating ELO, win/loss, streak, peak, and writing a player_matches row
// for analytics (partner chemistry, head-to-head, rating evolution).

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Tournament, Team, Match, Round } from "@/lib/types";
import { isPlaceholder } from "@/lib/types";
import { ratingChange, pairAverage, BASE_RATING } from "./elo";

/** lowercase, strip accents, collapse spaces — for fuzzy name matching. */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

interface PersonRef {
  name: string;
  phone?: string;
}

interface PlayedMatch {
  category: string;
  // side 1
  a1: PersonRef;
  a2?: PersonRef;
  // side 2
  b1: PersonRef;
  b2?: PersonRef;
  side1Won: boolean;
  score: string;
}

interface PlayerRow {
  id: string;
  rating: number;
  peak_rating: number;
  matches_played: number;
  wins: number;
  losses: number;
  current_streak: number;
}

function teamPeople(t: Team): PersonRef[] {
  const people: PersonRef[] = [
    { name: t.player1Name, phone: t.player1Phone },
  ];
  if (t.player2Name) people.push({ name: t.player2Name, phone: t.player2Phone });
  return people;
}

/** Pull every finished match (with a winner) out of the engine. */
function extractPlayedMatches(t: Tournament): PlayedMatch[] {
  const out: PlayedMatch[] = [];

  const handle = (category: string, m: Match) => {
    if (m.status !== "done" || !m.winnerId) return;
    if (isPlaceholder(m.team1) || isPlaceholder(m.team2)) return;
    const t1 = m.team1 as Team;
    const t2 = m.team2 as Team;
    const p1 = teamPeople(t1);
    const p2 = teamPeople(t2);
    const score =
      m.sets && m.sets.length
        ? m.sets.map((s) => `${s.s1}-${s.s2}`).join(", ")
        : m.score1 != null && m.score2 != null
          ? `${m.score1}-${m.score2}`
          : "";
    out.push({
      category,
      a1: p1[0],
      a2: p1[1],
      b1: p2[0],
      b2: p2[1],
      side1Won: m.winnerId === t1.id,
      score,
    });
  };

  const fromMatches = (category: string, ms: Match[]) => {
    for (const m of ms) handle(category, m);
  };
  const fromRounds = (category: string, rs: Round[]) => {
    for (const r of rs) fromMatches(category, r.matches);
  };

  for (const b of t.brackets ?? []) {
    fromRounds(b.category, b.rounds);
    if (b.consolationRounds) fromRounds(b.category, b.consolationRounds);
  }
  for (const g of t.groups ?? []) fromRounds(g.category, g.rounds);
  for (const j of t.jornadas ?? [])
    for (const c of j.courts) fromMatches("Liga", c.matches);

  return out;
}

export interface RankingResult {
  ok: boolean;
  processed?: number;
  playersTouched?: number;
  error?: string;
  skipped?: string;
}

/**
 * Processes a finished tournament into ranking updates. Idempotent: a
 * tournament is only counted once (guarded by tournaments.ranked).
 */
export async function processTournamentRanking(
  admin: SupabaseClient,
  tournament: Tournament & { ranked?: boolean; state?: string | null; municipality?: string | null },
): Promise<RankingResult> {
  if (tournament.status !== "done") {
    return { ok: false, skipped: "El torneo no está terminado." };
  }
  if (tournament.ranked) {
    return { ok: true, skipped: "Ya estaba contado en el ranking." };
  }

  const matches = extractPlayedMatches(tournament);
  if (matches.length === 0) {
    // Still mark as ranked so we don't reprocess an empty one forever.
    await admin.from("tournaments").update({ ranked: true }).eq("id", tournament.id);
    return { ok: true, processed: 0, playersTouched: 0 };
  }

  // ── Resolve every person to a persistent player (find or create) ──────
  const cache = new Map<string, PlayerRow>(); // key → player row

  const keyFor = (p: PersonRef) =>
    p.phone && p.phone.trim()
      ? "tel:" + p.phone.replace(/\D/g, "")
      : "name:" + normalizeName(p.name);

  async function resolvePlayer(p: PersonRef): Promise<PlayerRow | null> {
    if (!p.name?.trim()) return null;
    const key = keyFor(p);
    const cached = cache.get(key);
    if (cached) return cached;

    const phoneDigits = p.phone ? p.phone.replace(/\D/g, "") : "";
    const norm = normalizeName(p.name);

    // Try to find existing: phone first (strong), then normalized name.
    let found: PlayerRow | null = null;
    if (phoneDigits) {
      const { data } = await admin
        .from("players")
        .select("id, rating, peak_rating, matches_played, wins, losses, current_streak")
        .eq("phone", phoneDigits)
        .maybeSingle();
      if (data) found = data as PlayerRow;
    }
    if (!found) {
      const { data } = await admin
        .from("players")
        .select("id, rating, peak_rating, matches_played, wins, losses, current_streak")
        .eq("normalized_name", norm)
        .is("phone", null)
        .maybeSingle();
      if (data) found = data as PlayerRow;
    }

    if (!found) {
      const { data, error } = await admin
        .from("players")
        .insert({
          display_name: p.name.trim(),
          normalized_name: norm,
          phone: phoneDigits || null,
          state: tournament.state ?? null,
          municipality: tournament.municipality ?? null,
          rating: BASE_RATING,
          peak_rating: BASE_RATING,
        })
        .select("id, rating, peak_rating, matches_played, wins, losses, current_streak")
        .single();
      if (error || !data) return null;
      found = data as PlayerRow;
    }
    cache.set(key, found);
    return found;
  }

  let processed = 0;
  const pmRows: Record<string, unknown>[] = [];

  for (const m of matches) {
    const a1 = await resolvePlayer(m.a1);
    const a2 = m.a2 ? await resolvePlayer(m.a2) : null;
    const b1 = await resolvePlayer(m.b1);
    const b2 = m.b2 ? await resolvePlayer(m.b2) : null;
    if (!a1 || !b1) continue; // singles not supported in ranking yet

    const sideA = [a1, a2].filter(Boolean) as PlayerRow[];
    const sideB = [b1, b2].filter(Boolean) as PlayerRow[];
    const avgA = pairAverage(
      a1.rating,
      a2 ? a2.rating : a1.rating,
    );
    const avgB = pairAverage(
      b1.rating,
      b2 ? b2.rating : b1.rating,
    );

    const apply = (
      p: PlayerRow,
      partner: PlayerRow | null,
      opp1: PlayerRow,
      opp2: PlayerRow | null,
      ownAvg: number,
      oppAvg: number,
      won: boolean,
    ) => {
      const change = ratingChange(p.rating, ownAvg, oppAvg, won);
      pmRows.push({
        player_id: p.id,
        partner_id: partner?.id ?? null,
        opponent1_id: opp1.id,
        opponent2_id: opp2?.id ?? null,
        tournament_id: tournament.id,
        tournament_name: tournament.name,
        category: m.category,
        won,
        score: m.score,
        rating_before: p.rating,
        rating_after: change.next,
        rating_delta: change.delta,
      });
      // Mutate the cached row so subsequent matches use updated rating.
      p.rating = change.next;
      p.peak_rating = Math.max(p.peak_rating, change.next);
      p.matches_played += 1;
      if (won) p.wins += 1;
      else p.losses += 1;
      p.current_streak = won
        ? Math.max(1, p.current_streak + 1)
        : Math.min(-1, p.current_streak - 1);
    };

    apply(a1, a2, b1, b2, avgA, avgB, m.side1Won);
    if (a2) apply(a2, a1, b1, b2, avgA, avgB, m.side1Won);
    apply(b1, b2, a1, a2, avgB, avgA, !m.side1Won);
    if (b2) apply(b2, b1, a1, a2, avgB, avgA, !m.side1Won);

    void sideA;
    void sideB;
    processed += 1;
  }

  // ── Persist: player_matches rows + updated player stats ───────────────
  if (pmRows.length) {
    await admin.from("player_matches").insert(pmRows);
  }
  for (const [, p] of cache) {
    await admin
      .from("players")
      .update({
        rating: Math.round(p.rating),
        peak_rating: Math.round(p.peak_rating),
        matches_played: p.matches_played,
        wins: p.wins,
        losses: p.losses,
        current_streak: p.current_streak,
      })
      .eq("id", p.id);
  }

  await admin.from("tournaments").update({ ranked: true }).eq("id", tournament.id);

  return { ok: true, processed, playersTouched: cache.size };
}

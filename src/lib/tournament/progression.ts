// Propagates results through elimination and consolation brackets.

import type { Round, Match, Team } from "@/lib/types";
import { isPlaceholder } from "@/lib/types";

function winnerTeam(m: Match): Team | null {
  if (!m.winnerId) return null;
  if (!isPlaceholder(m.team1) && m.team1.id === m.winnerId) return m.team1;
  if (!isPlaceholder(m.team2) && m.team2.id === m.winnerId) return m.team2;
  return null;
}

function loserTeam(m: Match): Team | null {
  if (!m.winnerId) return null;
  if (!isPlaceholder(m.team1) && m.team1.id !== m.winnerId) return m.team1;
  if (!isPlaceholder(m.team2) && m.team2.id !== m.winnerId) return m.team2;
  return null;
}

/**
 * Walks an elimination bracket and pushes each completed match's winner into
 * the correct slot of the next round. Idempotent — safe to call after every
 * score update.
 */
export function advanceElimination(rounds: Round[]): void {
  for (let ri = 0; ri < rounds.length - 1; ri++) {
    const round = rounds[ri];
    const next = rounds[ri + 1];
    for (let mi = 0; mi < round.matches.length; mi++) {
      const m = round.matches[mi];
      if (m.status !== "done" || !m.winnerId) continue;
      const w = winnerTeam(m);
      if (!w) continue;
      const nextMatch = next.matches[Math.floor(mi / 2)];
      if (!nextMatch) continue;
      if (mi % 2 === 0) nextMatch.team1 = w;
      else nextMatch.team2 = w;
    }
  }
}

/**
 * Feeds the first-round losers of the main bracket into the first round of the
 * consolation bracket, then advances the consolation bracket itself.
 */
export function advanceConsolation(
  mainRounds: Round[],
  consolationRounds: Round[],
): void {
  if (consolationRounds.length === 0) return;
  const firstRound = mainRounds[0];
  const consolFirst = consolationRounds[0];
  if (!firstRound || !consolFirst) return;

  const losers: Team[] = [];
  for (const m of firstRound.matches) {
    if (m.status !== "done") continue;
    const l = loserTeam(m);
    if (l) losers.push(l);
  }

  // Pair losers into the consolation first round in order.
  for (let i = 0; i < consolFirst.matches.length; i++) {
    const cm = consolFirst.matches[i];
    const l1 = losers[i * 2];
    const l2 = losers[i * 2 + 1];
    if (l1) cm.team1 = l1;
    if (l2) cm.team2 = l2;
  }

  advanceElimination(consolationRounds);
}

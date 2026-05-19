// Standings calculation for round-robin and group play.

import type { Team, Round } from "@/lib/types";
import { isPlaceholder } from "@/lib/types";

export interface StandingRow {
  team: Team;
  played: number;
  won: number;
  lost: number;
  gamesFor: number;
  gamesAgainst: number;
  points: number; // 3 per win
}

/**
 * Computes a sorted standings table from a set of teams and their rounds.
 * Sort: points desc, then game difference desc.
 */
export function standings(teams: Team[], rounds: Round[]): StandingRow[] {
  const allMatches = rounds.flatMap((r) => r.matches);

  const rows: StandingRow[] = teams.map((team) => {
    let won = 0;
    let lost = 0;
    let played = 0;
    let gamesFor = 0;
    let gamesAgainst = 0;

    for (const m of allMatches) {
      if (m.status !== "done" || m.score1 === null || m.score2 === null) {
        continue;
      }
      if (!isPlaceholder(m.team1) && m.team1.id === team.id) {
        played++;
        gamesFor += m.score1;
        gamesAgainst += m.score2;
        if (m.score1 > m.score2) won++;
        else lost++;
      }
      if (!isPlaceholder(m.team2) && m.team2.id === team.id) {
        played++;
        gamesFor += m.score2;
        gamesAgainst += m.score1;
        if (m.score2 > m.score1) won++;
        else lost++;
      }
    }

    return {
      team,
      played,
      won,
      lost,
      gamesFor,
      gamesAgainst,
      points: won * 3,
    };
  });

  return rows.sort(
    (a, b) =>
      b.points - a.points ||
      b.gamesFor - b.gamesAgainst - (a.gamesFor - a.gamesAgainst),
  );
}

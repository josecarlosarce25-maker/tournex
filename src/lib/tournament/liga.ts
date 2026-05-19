// "Liga semanal" — weekly league with court promotion/relegation.
// Players sit on courts, play a mini round-robin per court, then winners
// move up a court and losers move down for the next jornada.

import type { Team, Match, Jornada, JornadaCourt } from "@/lib/types";
import { genId } from "@/lib/utils";

/** Builds one jornada: splits the ordered team list into courts. */
export function generateJornada(
  teams: Team[],
  pairsPerCourt: number,
  jornadaNumber: number,
): Jornada {
  const courts: JornadaCourt[] = [];
  for (let i = 0; i < teams.length; i += pairsPerCourt) {
    const courtTeams = teams.slice(i, i + pairsPerCourt);
    if (courtTeams.length < 2) continue;
    const matches: Match[] = [];
    for (let a = 0; a < courtTeams.length; a++) {
      for (let b = a + 1; b < courtTeams.length; b++) {
        matches.push({
          id: genId(),
          round: jornadaNumber,
          team1: courtTeams[a],
          team2: courtTeams[b],
          score1: null,
          score2: null,
          status: "pending",
          jornada: jornadaNumber,
        });
      }
    }
    courts.push({
      name: "Pista " + (courts.length + 1),
      teams: courtTeams,
      matches,
    });
  }
  return { number: jornadaNumber, courts, done: false };
}

export interface LigaStandingRow {
  team: Team;
  totalPoints: number;
  won: number;
  lost: number;
  jornadasPlayed: number;
}

/** Accumulated standings across every jornada played so far. */
export function ligaStandings(
  teams: Team[],
  jornadas: Jornada[],
): LigaStandingRow[] {
  const map = new Map<string, LigaStandingRow>();
  for (const t of teams) {
    map.set(t.id, {
      team: t,
      totalPoints: 0,
      won: 0,
      lost: 0,
      jornadasPlayed: 0,
    });
  }

  for (const jornada of jornadas) {
    for (const court of jornada.courts) {
      for (const team of court.teams) {
        const row = map.get(team.id);
        if (!row) continue;
        let won = 0;
        let lost = 0;
        let playedAny = false;
        for (const m of court.matches) {
          if (m.status !== "done" || m.score1 === null || m.score2 === null) {
            continue;
          }
          if (m.team1.id === team.id) {
            playedAny = true;
            if (m.score1 > m.score2) won++;
            else lost++;
          }
          if (m.team2.id === team.id) {
            playedAny = true;
            if (m.score2 > m.score1) won++;
            else lost++;
          }
        }
        row.won += won;
        row.lost += lost;
        row.totalPoints += won * 3;
        if (playedAny) row.jornadasPlayed++;
      }
    }
  }

  return [...map.values()].sort((a, b) => b.totalPoints - a.totalPoints);
}

/**
 * Reorders the team list after a finished jornada: the top finisher on each
 * court moves up one court, the bottom finisher moves down one court.
 * Returns the new flat ordering to feed into `generateJornada`.
 */
export function applyPromotionRelegation(jornada: Jornada): Team[] {
  const courtRankings: Team[][] = jornada.courts.map((court) => {
    const ranked = court.teams
      .map((team) => {
        let points = 0;
        for (const m of court.matches) {
          if (m.status !== "done" || m.score1 === null || m.score2 === null) {
            continue;
          }
          if (m.team1.id === team.id && m.score1 > m.score2) points += 3;
          if (m.team2.id === team.id && m.score2 > m.score1) points += 3;
        }
        return { team, points };
      })
      .sort((a, b) => b.points - a.points)
      .map((r) => r.team);
    return ranked;
  });

  const reordered: Team[][] = [];
  for (let ci = 0; ci < courtRankings.length; ci++) {
    const court = courtRankings[ci];
    for (let pi = 0; pi < court.length; pi++) {
      const isTop = pi === 0;
      const isBottom = pi === court.length - 1;
      let destCourt = ci;
      if (isTop && ci > 0) destCourt = ci - 1;
      if (isBottom && ci < courtRankings.length - 1) destCourt = ci + 1;
      if (!reordered[destCourt]) reordered[destCourt] = [];
      reordered[destCourt].push(court[pi]);
    }
  }
  return reordered.flat();
}

export function jornadaComplete(jornada: Jornada): boolean {
  return jornada.courts.every((c) =>
    c.matches.every((m) => m.status === "done"),
  );
}

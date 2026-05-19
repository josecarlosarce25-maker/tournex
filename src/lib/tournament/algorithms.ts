// Bracket / group / round-robin generation.
// Ported and typed from the original Tournex prototype.

import type {
  Team,
  Placeholder,
  Match,
  Round,
  Group,
} from "@/lib/types";
import { genId } from "@/lib/utils";

function bye(): Placeholder {
  return { id: "BYE", name: "BYE", placeholder: true };
}

function tbd(): Placeholder {
  return { id: "TBD_" + genId(), name: "Por definir", placeholder: true };
}

const ELIM_ROUND_NAMES: Record<number, string> = {
  2: "Final",
  4: "Semifinales",
  8: "Cuartos",
  16: "Octavos",
  32: "16vos",
  64: "32vos",
};

/**
 * Round-robin (Americano): every team plays every other team once.
 * Uses the circle method; a BYE is added for odd team counts.
 */
export function roundRobin(teams: Team[]): Round[] {
  const arr: (Team | Placeholder)[] = [...teams];
  if (arr.length % 2) arr.push(bye());
  const n = arr.length;
  const rounds: Round[] = [];

  for (let i = 0; i < n - 1; i++) {
    const matches: Match[] = [];
    for (let j = 0; j < n / 2; j++) {
      const t1 = arr[j];
      const t2 = arr[n - 1 - j];
      if (t1.id !== "BYE" && t2.id !== "BYE") {
        matches.push({
          id: genId(),
          round: i + 1,
          team1: t1,
          team2: t2,
          score1: null,
          score2: null,
          status: "pending",
        });
      }
    }
    rounds.push({ number: i + 1, matches });
    // Rotate: keep first fixed, move last into position 1.
    const last = arr.pop()!;
    arr.splice(1, 0, last);
  }
  return rounds;
}

/**
 * Single-elimination bracket. Pads to the next power of two with BYEs;
 * BYE matches are auto-resolved so the real team advances.
 */
export function elimination(teams: Team[]): Round[] {
  let size = 1;
  while (size < teams.length) size *= 2;

  const seeded: (Team | Placeholder)[] = [...teams];
  while (seeded.length < size) seeded.push(bye());

  const rounds: Round[] = [];
  let current: (Team | Placeholder)[] = seeded;
  let roundIndex = 1;

  while (current.length > 1) {
    const matches: Match[] = [];
    for (let i = 0; i < current.length; i += 2) {
      const t1 = current[i];
      const t2 = current[i + 1];
      const t1IsBye = t1.id === "BYE";
      const t2IsBye = t2.id === "BYE";
      const isBye = t1IsBye || t2IsBye;
      const winner = isBye ? (t1IsBye ? t2 : t1) : null;
      matches.push({
        id: genId(),
        round: roundIndex,
        roundName: ELIM_ROUND_NAMES[current.length] ?? `Ronda ${roundIndex}`,
        team1: t1,
        team2: t2,
        score1: isBye ? (t1IsBye ? 0 : null) : null,
        score2: isBye ? (t2IsBye ? 0 : null) : null,
        status: isBye ? "done" : "pending",
        winnerId: winner && winner.id !== "BYE" ? winner.id : null,
      });
    }
    rounds.push({
      number: roundIndex,
      name: ELIM_ROUND_NAMES[current.length] ?? `Ronda ${roundIndex}`,
      matches,
    });
    current = matches.map((m) => {
      if (m.winnerId) {
        const w = m.team1.id === m.winnerId ? m.team1 : m.team2;
        return w;
      }
      return tbd();
    });
    roundIndex++;
  }
  return rounds;
}

/**
 * Builds an empty consolation (losers) bracket sized for the first-round
 * losers of an elimination bracket. Teams are filled in as matches resolve.
 */
export function consolationBracket(mainRounds: Round[]): Round[] {
  const firstRound = mainRounds[0];
  if (!firstRound) return [];
  // Number of first-round losers (ignoring BYE matches).
  const realMatches = firstRound.matches.filter(
    (m) => m.status !== "done" || m.winnerId === null,
  );
  const loserCount = realMatches.length;
  if (loserCount < 2) return [];

  let size = 1;
  while (size < loserCount) size *= 2;
  const slots: (Team | Placeholder)[] = [];
  for (let i = 0; i < size; i++) slots.push(tbd());

  const rounds: Round[] = [];
  let current = slots;
  let roundIndex = 1;
  while (current.length > 1) {
    const matches: Match[] = [];
    for (let i = 0; i < current.length; i += 2) {
      matches.push({
        id: genId(),
        round: roundIndex,
        roundName:
          "Consolación · " +
          (ELIM_ROUND_NAMES[current.length] ?? `Ronda ${roundIndex}`),
        team1: current[i],
        team2: current[i + 1],
        score1: null,
        score2: null,
        status: "pending",
        consolation: true,
      });
    }
    rounds.push({
      number: roundIndex,
      name:
        "Consolación · " +
        (ELIM_ROUND_NAMES[current.length] ?? `Ronda ${roundIndex}`),
      matches,
    });
    current = matches.map(() => tbd());
    roundIndex++;
  }
  return rounds;
}

/**
 * Splits teams into groups of (target) size `groupSize` (shuffled), each
 * running its own internal round-robin.
 *
 * Crucially, the distribution is **balanced**: with 4 teams and groupSize=3
 * we make 2 groups of 2, NOT one group of 3 and a lonely group of 1.
 * Every group ends with at least 2 teams (otherwise it can't play).
 */
export function groups(
  teams: Team[],
  groupSize: number,
  category: string,
): Group[] {
  const shuffled = [...teams].sort(() => Math.random() - 0.5);
  const n = shuffled.length;
  if (n < 2) return [];
  // Decide group count so every group can hold at least 2 teams.
  let groupCount = Math.max(1, Math.ceil(n / groupSize));
  while (Math.floor(n / groupCount) < 2 && groupCount > 1) groupCount--;
  // Even-ish distribution: the first `extra` groups get one more team.
  const baseSize = Math.floor(n / groupCount);
  const extra = n % groupCount;

  const result: Group[] = [];
  let cursor = 0;
  for (let i = 0; i < groupCount; i++) {
    const size = baseSize + (i < extra ? 1 : 0);
    const groupTeams = shuffled.slice(cursor, cursor + size);
    cursor += size;
    result.push({
      name: "Grupo " + String.fromCharCode(65 + i),
      category,
      teams: groupTeams,
      rounds: roundRobin(groupTeams),
    });
  }
  return result;
}

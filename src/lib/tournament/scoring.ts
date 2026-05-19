// Score validation by score format.
// Each format produces an aggregate (score1/score2) plus optional per-set
// detail. The aggregate is what standings and brackets consume.

import type { ScoreFormat, SetScore } from "@/lib/types";

export interface ScoreResult {
  valid: boolean;
  error?: string;
  score1: number; // games won (single-set formats) or sets won (best-of-3)
  score2: number;
  sets?: SetScore[];
  winner: 1 | 2 | null;
}

export const SCORE_FORMAT_LABELS: Record<ScoreFormat, string> = {
  "8games": "Un set a 8 juegos",
  "1set": "1 set a 6",
  "2of3short": "2 de 3 (3er set super tiebreak)",
  "2of3full": "2 de 3 sets completos",
};

/** True when the format is decided by best-of-3 sets rather than one set. */
export function isBestOfThree(format: ScoreFormat): boolean {
  return format === "2of3short" || format === "2of3full";
}

/** How many set inputs the UI should render for a given format. */
export function setsNeeded(format: ScoreFormat): number {
  return isBestOfThree(format) ? 3 : 1;
}

/** Validates a single set under a "to N games" rule (e.g. N=8 or N=6). */
function validateSet(
  s1: number,
  s2: number,
  target: number,
  allowTiebreakAt: number, // games count at which a tiebreak game is allowed
): string | null {
  if (s1 < 0 || s2 < 0) return "Los marcadores no pueden ser negativos.";
  if (s1 === s2) return "Un set no puede terminar empatado.";
  const hi = Math.max(s1, s2);
  const lo = Math.min(s1, s2);
  // Tiebreak game: hi reaches allowTiebreakAt with lo one below.
  if (hi === allowTiebreakAt && lo === allowTiebreakAt - 1) return null;
  if (hi < target) return `El ganador del set debe llegar a ${target}.`;
  if (hi === target && hi - lo < 2 && hi !== allowTiebreakAt) {
    return `Marcador inválido: con ${target} debe haber 2 de diferencia.`;
  }
  if (hi > allowTiebreakAt) return "Marcador demasiado alto para este set.";
  return null;
}

/**
 * Validates raw set inputs for the given score format.
 * `sets` is an array of {s1,s2}; single-set formats use only the first entry.
 */
export function validateScore(
  format: ScoreFormat,
  sets: SetScore[],
): ScoreResult {
  const fail = (error: string): ScoreResult => ({
    valid: false,
    error,
    score1: 0,
    score2: 0,
    winner: null,
  });

  if (format === "8games") {
    const set = sets[0];
    if (!set) return fail("Falta el marcador.");
    const err = validateSet(set.s1, set.s2, 8, 9);
    if (err) return fail(err);
    return {
      valid: true,
      score1: set.s1,
      score2: set.s2,
      sets: [set],
      winner: set.s1 > set.s2 ? 1 : 2,
    };
  }

  if (format === "1set") {
    const set = sets[0];
    if (!set) return fail("Falta el marcador.");
    const err = validateSet(set.s1, set.s2, 6, 7);
    if (err) return fail(err);
    return {
      valid: true,
      score1: set.s1,
      score2: set.s2,
      sets: [set],
      winner: set.s1 > set.s2 ? 1 : 2,
    };
  }

  // Best of 3.
  const played = sets.filter(
    (s) => s && !(s.s1 === 0 && s.s2 === 0),
  );
  if (played.length < 2) return fail("Se necesitan al menos 2 sets.");

  let setsWon1 = 0;
  let setsWon2 = 0;
  for (let i = 0; i < played.length; i++) {
    const set = played[i];
    const isDecider = i === 2;
    let err: string | null;
    if (isDecider && format === "2of3short") {
      // Super tiebreak to 10, win by 2.
      if (set.s1 === set.s2) err = "El super tiebreak no puede empatar.";
      else if (Math.max(set.s1, set.s2) < 10)
        err = "El super tiebreak se juega a 10 puntos.";
      else if (Math.abs(set.s1 - set.s2) < 2)
        err = "El super tiebreak se gana por 2 de diferencia.";
      else err = null;
    } else {
      err = validateSet(set.s1, set.s2, 6, 7);
    }
    if (err) return fail(`Set ${i + 1}: ${err}`);
    if (set.s1 > set.s2) setsWon1++;
    else setsWon2++;
  }

  if (setsWon1 < 2 && setsWon2 < 2) {
    return fail("Nadie ha ganado 2 sets todavía.");
  }
  if (played.length === 3 && (setsWon1 === 3 || setsWon2 === 3)) {
    return fail("No se juega un 3er set si ya hay un ganador en 2.");
  }

  return {
    valid: true,
    score1: setsWon1,
    score2: setsWon2,
    sets: played,
    winner: setsWon1 > setsWon2 ? 1 : 2,
  };
}

/** Human-readable score, e.g. "6-4 / 4-6 / 10-8" or "8-5". */
export function formatScoreLine(sets?: SetScore[]): string {
  if (!sets || sets.length === 0) return "";
  return sets.map((s) => `${s.s1}-${s.s2}`).join(" / ");
}

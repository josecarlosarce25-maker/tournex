// ELO rating for padel (a 2-vs-2 game).
//
// A pair's strength is the average of its two players. We compute the
// expected result of the pair vs the opponent pair, then apply the SAME
// delta to both players on each side — so playing (and winning) alongside
// a strong partner against strong rivals is worth more.

export const BASE_RATING = 1000;
const K = 32; // sensitivity; higher = ratings move faster

/** Expected score (0..1) of pair A vs pair B given their average ratings. */
export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export interface RatingChange {
  delta: number; // points gained (+) or lost (-)
  next: number; // resulting rating
}

/**
 * Computes the rating delta for ONE player on a side, given:
 *  - their current rating
 *  - the average rating of their pair
 *  - the average rating of the opposing pair
 *  - whether their side won
 */
export function ratingChange(
  playerRating: number,
  ownPairAvg: number,
  oppPairAvg: number,
  won: boolean,
): RatingChange {
  const expected = expectedScore(ownPairAvg, oppPairAvg);
  const actual = won ? 1 : 0;
  const delta = Math.round(K * (actual - expected));
  return { delta, next: Math.max(100, playerRating + delta) };
}

/** Average of two player ratings (a pair's strength). */
export function pairAverage(r1: number, r2: number): number {
  return (r1 + r2) / 2;
}

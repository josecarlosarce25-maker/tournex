// Assigns courts and start times to matches across rounds.

import type { Round } from "@/lib/types";
import { timeToMinutes, minutesToTime } from "@/lib/utils";

export interface ScheduleOptions {
  courts: number;
  startTime: string; // "HH:MM"
  matchDuration: number; // minutes
  deadStart?: string; // dead time start "HH:MM"
  deadEnd?: string; // dead time end "HH:MM"
}

/**
 * Mutates the given rounds, filling in `court` and `scheduledTime` for every
 * pending match. Dead-time windows are skipped. Matches already marked "done"
 * (e.g. BYEs) keep no schedule.
 */
export function scheduleRounds(rounds: Round[], opts: ScheduleOptions): void {
  const { courts, startTime, matchDuration } = opts;
  const deadStart = opts.deadStart ? timeToMinutes(opts.deadStart) : null;
  const deadEnd = opts.deadEnd ? timeToMinutes(opts.deadEnd) : null;

  let cursor = timeToMinutes(startTime);

  for (const round of rounds) {
    const pending = round.matches.filter((m) => m.status !== "done");
    let courtNum = 1;
    let slot = cursor;

    for (const match of pending) {
      if (deadStart !== null && deadEnd !== null) {
        if (slot >= deadStart && slot < deadEnd) slot = deadEnd;
      }
      match.court = `Cancha ${courtNum}`;
      match.scheduledTime = minutesToTime(slot);
      courtNum++;
      if (courtNum > courts) {
        courtNum = 1;
        slot += matchDuration;
      }
    }
    // Next round starts after the last used slot.
    cursor = slot + matchDuration;
  }
}

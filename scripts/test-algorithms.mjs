#!/usr/bin/env node
// Smoke test for tournament algorithms (round-robin, elimination, groups).
// Run with: node scripts/test-algorithms.mjs

import { execSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";

const testCode = `
import { roundRobin, elimination, groups } from "../src/lib/tournament/algorithms";
import type { Team } from "../src/lib/types";

const team = (id: string, name: string): Team => ({
  id, name, players: [{ name }], category: "General",
});

function teams(n: number) {
  return Array.from({ length: n }, (_, i) => team("t" + i, "Pareja " + (i + 1)));
}

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("\\u2717", msg);
    process.exit(1);
  }
  console.log("\\u2713", msg);
}

// Round robin
const rr3 = roundRobin(teams(3));
assert(rr3.length === 3, "round-robin: 3 teams → 3 rounds (with bye)");

const rr4 = roundRobin(teams(4));
assert(rr4.length === 3, "round-robin: 4 teams → 3 rounds");
const totalMatches4 = rr4.reduce((s, r) => s + r.matches.length, 0);
assert(totalMatches4 === 6, "round-robin: 4 teams → 6 matches");

const rr8 = roundRobin(teams(8));
assert(rr8.length === 7, "round-robin: 8 teams → 7 rounds");
const totalMatches8 = rr8.reduce((s, r) => s + r.matches.length, 0);
assert(totalMatches8 === 28, "round-robin: 8 teams → 28 matches");

// Elimination
const el2 = elimination(teams(2));
assert(el2.length === 1, "elimination: 2 teams → 1 round");

const el4 = elimination(teams(4));
assert(el4.length === 2, "elimination: 4 teams → 2 rounds (semis + final)");

const el8 = elimination(teams(8));
assert(el8.length === 3, "elimination: 8 teams → 3 rounds");

const el5 = elimination(teams(5));
assert(el5.length === 3, "elimination: 5 teams → 3 rounds (padded to 8 with BYEs)");
const firstRoundDoneByes = el5[0].matches.filter((m) => m.status === "done").length;
assert(firstRoundDoneByes === 3, "elimination: 5 teams → 3 first-round BYEs auto-resolved");

// Groups (the bug from before)
const g4 = groups(teams(4), 3, "General");
assert(g4.length === 2, "groups: 4 teams + groupSize 3 → 2 groups (NOT 3+1)");
assert(g4[0].teams.length >= 2 && g4[1].teams.length >= 2, "groups: every group has ≥2 teams");

const g6 = groups(teams(6), 3, "General");
assert(g6.length === 2, "groups: 6 teams + groupSize 3 → 2 groups of 3");
assert(g6[0].teams.length === 3, "groups: 6/3 → first group has 3");
assert(g6[1].teams.length === 3, "groups: 6/3 → second group has 3");

const g7 = groups(teams(7), 4, "General");
assert(g7.length === 2, "groups: 7 teams + groupSize 4 → 2 groups");
assert(g7[0].teams.length === 4, "groups: 7/4 → first group has 4");
assert(g7[1].teams.length === 3, "groups: 7/4 → second group has 3");

const g3 = groups(teams(3), 3, "General");
assert(g3.length === 1, "groups: 3 teams + groupSize 3 → 1 group of 3");

const g1 = groups(teams(1), 3, "General");
assert(g1.length === 0, "groups: 1 team → no groups (can't play)");

console.log("\\n\\u2713 All algorithm tests passed.");
`;

const tmpFile = "scripts/_test-algorithms.ts";
writeFileSync(tmpFile, testCode);

try {
  execSync(`npx tsx --no-warnings ${tmpFile}`, {
    stdio: "inherit",
    cwd: process.cwd(),
  });
} finally {
  try {
    unlinkSync(tmpFile);
  } catch {}
}

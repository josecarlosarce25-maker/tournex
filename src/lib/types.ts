// Domain types for Tournex — shared across UI, algorithms and the data layer.

export type TournamentFormat =
  | "round_robin"
  | "elimination"
  | "groups_elim"
  | "liga_semanal";

export type ScoreFormat = "8games" | "1set" | "2of3short" | "2of3full";

export type TournamentStatus = "draft" | "open" | "live" | "done";

export type MatchStatus = "pending" | "live" | "done";

export type TeamStatus = "pending" | "confirmed" | "paid" | "cancelled";

/** A single set within a match, e.g. { s1: 6, s2: 4 }. */
export interface SetScore {
  s1: number;
  s2: number;
}

export interface Team {
  id: string;
  name: string; // formatted: "J. Pérez / M. Gómez"
  player1Name: string;
  player1Phone?: string;
  player1Email?: string;
  player1ShirtSize?: string;
  player2Name?: string;
  player2Phone?: string;
  player2Email?: string;
  player2ShirtSize?: string;
  category: string;
  status: TeamStatus;
}

export interface Match {
  id: string;
  round: number;
  roundName?: string;
  groupName?: string;
  court?: string;
  scheduledTime?: string; // "HH:MM"
  team1: Team | Placeholder;
  team2: Team | Placeholder;
  /** Aggregate score (games or sets won). Null until played. */
  score1: number | null;
  score2: number | null;
  /** Detailed per-set scores when the score format uses sets. */
  sets?: SetScore[];
  winnerId?: string | null;
  status: MatchStatus;
  jornada?: number;
  /** Marks a match in the consolation (losers) bracket. */
  consolation?: boolean;
}

/** A team slot that is not yet decided (BYE or "winner of match X"). */
export interface Placeholder {
  id: string; // "BYE" or "TBD_xxx"
  name: string; // "BYE" or "Por definir"
  placeholder: true;
}

export function isPlaceholder(t: Team | Placeholder): t is Placeholder {
  return (t as Placeholder).placeholder === true;
}

export interface Round {
  number: number;
  name?: string; // "Cuartos", "Semifinales", "Final"...
  matches: Match[];
}

export interface CategoryBracket {
  category: string;
  format: TournamentFormat;
  teams: Team[];
  rounds: Round[];
  /** Optional parallel losers bracket. */
  consolationRounds?: Round[];
}

export interface Group {
  name: string; // "Grupo A"
  category: string;
  teams: Team[];
  rounds: Round[];
}

export interface JornadaCourt {
  name: string; // "Pista 1"
  teams: Team[];
  matches: Match[];
}

export interface Jornada {
  number: number;
  courts: JornadaCourt[];
  done: boolean;
}

export interface Tournament {
  id: string;
  slug: string;
  organizerId?: string;
  name: string;
  sport: string;
  location?: string;
  date?: string;
  days: number;
  weeks: number;
  isLiga: boolean;
  format: TournamentFormat;
  scoreFormat: ScoreFormat;
  courts: number;
  maxPairs?: number;
  groupSize: number;
  minMatches?: number;
  startTime: string;
  endTime: string;
  matchDuration: number;
  finalTime?: string;
  deadStart?: string;
  deadEnd?: string;
  price?: number;
  payLink?: string;
  deadline?: string;
  consolation: boolean;
  includesShirt: boolean;
  categories: string[];
  status: TournamentStatus;
  // Registered pairs/teams (before brackets are generated).
  teams?: Team[];
  // Generated structures (persisted as JSON / derived from matches table).
  brackets?: CategoryBracket[];
  groups?: Group[];
  jornadas?: Jornada[];
  currentJornada?: number;
  createdAt?: string;
}

export interface Contact {
  id: string;
  organizerId?: string;
  name: string;
  phone?: string;
  email?: string;
  category?: string;
  tournamentsPlayed: string[];
}

export interface Organizer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

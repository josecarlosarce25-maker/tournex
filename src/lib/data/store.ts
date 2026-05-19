// ─────────────────────────────────────────────────────────────
// Capa de datos de Tournex — sobre Supabase.
//
// Cada función es async (regresa Promise). La UI debe usar `await`.
// La forma de los datos (Tournament, Team, etc.) es la misma que en
// los tipos de dominio; aquí adentro convertimos entre snake_case
// (columnas de Supabase) y camelCase (lo que la app espera).
// ─────────────────────────────────────────────────────────────
"use client";

import { createClient } from "@/lib/supabase/client";
import type {
  Tournament,
  Team,
  Contact,
  Organizer,
  TournamentStatus,
  TournamentFormat,
  ScoreFormat,
  CategoryBracket,
  Group,
  Jornada,
  SetScore,
  Match,
} from "@/lib/types";
import { isPlaceholder } from "@/lib/types";
import { slugify, formatPairName } from "@/lib/utils";
import {
  roundRobin,
  elimination,
  consolationBracket,
  groups as buildGroups,
  scheduleRounds,
  generateJornada,
  applyPromotionRelegation,
  jornadaComplete,
  validateScore,
  advanceElimination,
  advanceConsolation,
} from "@/lib/tournament";
import type { Database } from "@/lib/database.types";

// Single shared browser client.
const supabase = createClient();
export { supabase };

// ── Row converters ───────────────────────────────────────────

type TournamentRow = Database["public"]["Tables"]["tournaments"]["Row"];
type TeamRow = Database["public"]["Tables"]["teams"]["Row"];
type ContactRow = Database["public"]["Tables"]["contacts"]["Row"];

function teamFromRow(row: TeamRow): Team {
  return {
    id: row.id,
    name: row.name,
    player1Name: row.player1_name,
    player1Phone: row.player1_phone ?? undefined,
    player1Email: row.player1_email ?? undefined,
    player1ShirtSize: row.player1_shirt_size ?? undefined,
    player2Name: row.player2_name ?? undefined,
    player2Phone: row.player2_phone ?? undefined,
    player2Email: row.player2_email ?? undefined,
    player2ShirtSize: row.player2_shirt_size ?? undefined,
    category: row.category ?? "General",
    status: (row.status as Team["status"]) ?? "pending",
  };
}

interface EngineBlob {
  brackets?: CategoryBracket[];
  groups?: Group[];
  jornadas?: Jornada[];
  currentJornada?: number;
}

function tournamentFromRow(row: TournamentRow, teams: Team[]): Tournament {
  const engine = (row.engine as EngineBlob | null) ?? {};
  return {
    id: row.id,
    slug: row.slug,
    organizerId: row.organizer_id,
    name: row.name,
    sport: row.sport,
    location: row.location ?? undefined,
    date: row.date ?? undefined,
    days: row.days,
    weeks: row.weeks,
    isLiga: row.is_liga,
    format: row.format as TournamentFormat,
    scoreFormat: row.score_format as ScoreFormat,
    courts: row.courts,
    maxPairs: row.max_pairs ?? undefined,
    groupSize: row.group_size,
    minMatches: row.min_matches ?? undefined,
    startTime: row.start_time,
    endTime: row.end_time,
    matchDuration: row.match_duration,
    finalTime: row.final_time ?? undefined,
    deadStart: row.dead_start ?? undefined,
    deadEnd: row.dead_end ?? undefined,
    price: row.price ?? undefined,
    payLink: row.pay_link ?? undefined,
    deadline: row.deadline ?? undefined,
    consolation: row.consolation,
    includesShirt: row.includes_shirt,
    categories: Array.isArray(row.categories)
      ? (row.categories as string[])
      : ["General"],
    status: row.status as TournamentStatus,
    teams,
    brackets: engine.brackets,
    groups: engine.groups,
    jornadas: engine.jornadas,
    currentJornada: engine.currentJornada,
    createdAt: row.created_at,
  };
}

function contactFromRow(row: ContactRow): Contact {
  return {
    id: row.id,
    organizerId: row.organizer_id,
    name: row.name,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    category: row.category ?? undefined,
    tournamentsPlayed: row.tournaments_played ?? [],
  };
}

// ── Auth ─────────────────────────────────────────────────────

/** Returns the signed-in organizer (joined with the auth user), or null. */
export async function getUser(): Promise<Organizer | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: org } = await supabase
    .from("organizers")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (org) {
    return {
      id: org.id,
      name: org.name,
      email: org.email,
      phone: org.phone ?? undefined,
    };
  }
  // Trigger hasn't fired yet — fall back to auth user.
  return {
    id: user.id,
    name:
      (user.user_metadata?.name as string | undefined) ??
      user.email?.split("@")[0] ??
      "Organizador",
    email: user.email ?? "",
  };
}

/** Sends a magic-link to the given email. On first login the user gets a row in `organizers` (via SQL trigger). */
export async function signInWithMagicLink(
  email: string,
  name: string,
  phone?: string,
): Promise<{ ok: boolean; error?: string }> {
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : undefined;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
      data: { name, phone },
    },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Signs an existing user in with email + password. */
export async function signInWithPassword(
  email: string,
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: localizeAuthError(error.message) };
  return { ok: true };
}

/**
 * Creates a brand-new account with email + password.
 *
 * If Supabase is configured with "Confirm email = OFF", a session is
 * returned immediately and we report `confirmed: true`. Otherwise the user
 * has to click a verification link before they can sign in.
 */
export async function signUpWithPassword(
  email: string,
  password: string,
  name: string,
  phone?: string,
): Promise<{ ok: boolean; error?: string; confirmed?: boolean }> {
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : undefined;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: { name, phone },
    },
  });
  if (error) return { ok: false, error: localizeAuthError(error.message) };
  return { ok: true, confirmed: !!data.session };
}

/** Sends a password reset email. */
export async function sendPasswordReset(
  email: string,
): Promise<{ ok: boolean; error?: string }> {
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?reset=true`
      : undefined;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signOut() {
  await supabase.auth.signOut();
}

/** Translates the most common Supabase auth errors to friendly Spanish. */
function localizeAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "Correo o contraseña incorrectos.";
  if (m.includes("user already registered"))
    return "Ya existe una cuenta con ese correo. Inicia sesión.";
  if (m.includes("password should be at least"))
    return "La contraseña debe tener al menos 6 caracteres.";
  if (m.includes("email not confirmed"))
    return "Revisa tu correo: tienes que confirmar tu cuenta antes de entrar.";
  if (m.includes("unsupported provider"))
    return "Ese método de inicio de sesión no está activado todavía.";
  return msg;
}

// ── Tournaments ──────────────────────────────────────────────

async function loadTeamsFor(tournamentId: string): Promise<Team[]> {
  const { data } = await supabase
    .from("teams")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("registered_at", { ascending: true });
  return (data ?? []).map(teamFromRow);
}

export async function listTournaments(): Promise<Tournament[]> {
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  // Load team counts in parallel.
  const tournaments = await Promise.all(
    data.map(async (row) => tournamentFromRow(row, await loadTeamsFor(row.id))),
  );
  return tournaments;
}

export async function getTournament(id: string): Promise<Tournament | null> {
  const { data } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const teams = await loadTeamsFor(data.id);
  return tournamentFromRow(data, teams);
}

export async function getTournamentBySlug(
  slug: string,
): Promise<Tournament | null> {
  const { data } = await supabase
    .from("tournaments")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return null;
  const teams = await loadTeamsFor(data.id);
  return tournamentFromRow(data, teams);
}

/** Data collected by the 3-step creation wizard. */
export interface WizardData {
  name: string;
  sport: string;
  location?: string;
  date?: string;
  days?: number;
  weeks?: number;
  isLiga?: boolean;
  format: TournamentFormat;
  scoreFormat: ScoreFormat;
  categories: string[];
  consolation?: boolean;
  courts?: number;
  maxPairs?: number;
  groupSize?: number;
  minMatches?: number;
  startTime?: string;
  endTime?: string;
  matchDuration?: number;
  finalTime?: string;
  deadStart?: string;
  deadEnd?: string;
  price?: number;
  payLink?: string;
  deadline?: string;
  includesShirt?: boolean;
}

export async function createTournament(
  w: WizardData,
): Promise<{ ok: boolean; error?: string; tournament?: Tournament }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Inicia sesión primero." };

  const insertRow: Database["public"]["Tables"]["tournaments"]["Insert"] = {
    organizer_id: user.id,
    slug: slugify(w.name),
    name: w.name,
    sport: w.sport || "Pádel",
    location: w.location,
    date: w.date,
    days: w.days ?? 1,
    weeks: w.weeks ?? 8,
    is_liga: w.isLiga ?? false,
    format: w.format,
    score_format: w.scoreFormat,
    courts: w.courts ?? 4,
    max_pairs: w.maxPairs ?? null,
    group_size: w.groupSize ?? 3,
    min_matches: w.minMatches ?? null,
    start_time: w.startTime ?? "09:00",
    end_time: w.endTime ?? "20:00",
    match_duration: w.matchDuration ?? 45,
    final_time: w.finalTime,
    dead_start: w.deadStart,
    dead_end: w.deadEnd,
    price: w.price ?? null,
    pay_link: w.payLink,
    deadline: w.deadline,
    consolation: w.consolation ?? false,
    includes_shirt: w.includesShirt ?? false,
    categories: w.categories.length ? w.categories : ["General"],
    status: "draft",
  };

  const { data, error } = await supabase
    .from("tournaments")
    .insert(insertRow)
    .select("*")
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message ?? "No se pudo crear el torneo." };
  }
  return { ok: true, tournament: tournamentFromRow(data, []) };
}

export async function updateTournament(
  id: string,
  patch: Database["public"]["Tables"]["tournaments"]["Update"],
) {
  await supabase.from("tournaments").update(patch).eq("id", id);
}

export async function setStatus(id: string, status: TournamentStatus) {
  await updateTournament(id, { status });
}

export async function deleteTournament(id: string) {
  await supabase.from("tournaments").delete().eq("id", id);
}

// ── Teams ────────────────────────────────────────────────────

export interface NewTeamInput {
  player1Name: string;
  player1Phone?: string;
  player1Email?: string;
  player1ShirtSize?: string;
  player2Name?: string;
  player2Phone?: string;
  player2Email?: string;
  player2ShirtSize?: string;
  category: string;
}

export async function addTeam(
  tournamentId: string,
  input: NewTeamInput,
): Promise<{ ok: boolean; error?: string }> {
  if (!input.player1Name.trim()) {
    return { ok: false, error: "El jugador 1 es obligatorio." };
  }

  const t = await getTournament(tournamentId);
  if (!t) return { ok: false, error: "Torneo no encontrado." };
  if (t.maxPairs && (t.teams?.length ?? 0) >= t.maxPairs) {
    return { ok: false, error: "El cupo está lleno." };
  }

  const row: Database["public"]["Tables"]["teams"]["Insert"] = {
    tournament_id: tournamentId,
    name: formatPairName(input.player1Name, input.player2Name),
    player1_name: input.player1Name.trim(),
    player1_phone: input.player1Phone || null,
    player1_email: input.player1Email || null,
    player1_shirt_size: input.player1ShirtSize || null,
    player2_name: input.player2Name?.trim() || null,
    player2_phone: input.player2Phone || null,
    player2_email: input.player2Email || null,
    player2_shirt_size: input.player2ShirtSize || null,
    category: input.category || "General",
    status: "pending",
  };

  const { error } = await supabase.from("teams").insert(row);
  if (error) return { ok: false, error: error.message };

  // Flip a draft tournament into "open" the moment the first pair is registered.
  if (t.status === "draft") {
    await updateTournament(tournamentId, { status: "open" });
  }

  // Best-effort contact upsert (skipped silently for anonymous registrations).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user && user.id === t.organizerId) {
    await upsertContacts(user.id, t.name, input);
  }

  return { ok: true };
}

async function upsertContacts(
  organizerId: string,
  tournamentName: string,
  input: NewTeamInput,
) {
  const pairs: { name: string; phone?: string; email?: string }[] = [
    {
      name: input.player1Name,
      phone: input.player1Phone,
      email: input.player1Email,
    },
  ];
  if (input.player2Name) {
    pairs.push({
      name: input.player2Name,
      phone: input.player2Phone,
      email: input.player2Email,
    });
  }
  for (const p of pairs) {
    const { data: existing } = await supabase
      .from("contacts")
      .select("*")
      .eq("organizer_id", organizerId)
      .ilike("name", p.name)
      .maybeSingle();
    if (existing) {
      const tournaments = existing.tournaments_played ?? [];
      if (!tournaments.includes(tournamentName)) {
        await supabase
          .from("contacts")
          .update({
            tournaments_played: [...tournaments, tournamentName],
            phone: existing.phone ?? p.phone ?? null,
            email: existing.email ?? p.email ?? null,
          })
          .eq("id", existing.id);
      }
    } else {
      await supabase.from("contacts").insert({
        organizer_id: organizerId,
        name: p.name,
        phone: p.phone || null,
        email: p.email || null,
        category: input.category,
        tournaments_played: [tournamentName],
      });
    }
  }
}

export async function updateTeamStatus(
  _tournamentId: string,
  teamId: string,
  status: Team["status"],
) {
  await supabase.from("teams").update({ status }).eq("id", teamId);
}

export async function removeTeam(_tournamentId: string, teamId: string) {
  await supabase.from("teams").delete().eq("id", teamId);
}

// ── Engine (brackets / scores / liga) ────────────────────────

async function patchEngine(
  tournamentId: string,
  fn: (t: Tournament) => Partial<EngineBlob>,
  alsoStatus?: TournamentStatus,
): Promise<{ ok: boolean; error?: string }> {
  const t = await getTournament(tournamentId);
  if (!t) return { ok: false, error: "Torneo no encontrado." };
  const engine: EngineBlob = {
    brackets: t.brackets,
    groups: t.groups,
    jornadas: t.jornadas,
    currentJornada: t.currentJornada,
    ...fn(t),
  };
  const update: Database["public"]["Tables"]["tournaments"]["Update"] = {
    engine: engine as unknown as Database["public"]["Tables"]["tournaments"]["Row"]["engine"],
  };
  if (alsoStatus) update.status = alsoStatus;
  const { error } = await supabase
    .from("tournaments")
    .update(update)
    .eq("id", tournamentId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function generateBrackets(
  tournamentId: string,
): Promise<{ ok: boolean; error?: string }> {
  const t = await getTournament(tournamentId);
  if (!t) return { ok: false, error: "Torneo no encontrado." };
  const teams = t.teams ?? [];
  if (teams.length < 2) {
    return { ok: false, error: "Necesitas al menos 2 parejas." };
  }
  const scheduleOpts = {
    courts: t.courts,
    startTime: t.startTime,
    matchDuration: t.matchDuration,
    deadStart: t.deadStart,
    deadEnd: t.deadEnd,
  };

  const next: EngineBlob = {};

  if (t.format === "round_robin") {
    const brackets: CategoryBracket[] = [];
    for (const cat of t.categories) {
      const catTeams = teams.filter((tm) => tm.category === cat);
      if (catTeams.length < 2) continue;
      const rounds = roundRobin(catTeams);
      scheduleRounds(rounds, scheduleOpts);
      brackets.push({
        category: cat,
        format: "round_robin",
        teams: catTeams,
        rounds,
      });
    }
    next.brackets = brackets;
  } else if (t.format === "elimination") {
    const brackets: CategoryBracket[] = [];
    for (const cat of t.categories) {
      const catTeams = teams
        .filter((tm) => tm.category === cat)
        .sort(() => Math.random() - 0.5);
      if (catTeams.length < 2) continue;
      const rounds = elimination(catTeams);
      scheduleRounds(rounds, scheduleOpts);
      const bracket: CategoryBracket = {
        category: cat,
        format: "elimination",
        teams: catTeams,
        rounds,
      };
      if (t.consolation) {
        bracket.consolationRounds = consolationBracket(rounds);
      }
      brackets.push(bracket);
    }
    next.brackets = brackets;
  } else if (t.format === "groups_elim") {
    const allGroups: Group[] = [];
    for (const cat of t.categories) {
      const catTeams = teams
        .filter((tm) => tm.category === cat)
        .sort(() => Math.random() - 0.5);
      if (catTeams.length < 2) continue;
      for (const g of buildGroups(catTeams, t.groupSize, cat)) {
        scheduleRounds(g.rounds, scheduleOpts);
        allGroups.push(g);
      }
    }
    next.groups = allGroups;
  } else if (t.format === "liga_semanal") {
    const jornada = generateJornada(teams, t.groupSize, 1);
    next.jornadas = [jornada];
    next.currentJornada = 1;
  }

  return patchEngine(tournamentId, () => next, "open");
}

function findMatch(t: Tournament, matchId: string): Match | null {
  for (const b of t.brackets ?? []) {
    for (const r of b.rounds) {
      for (const m of r.matches) if (m.id === matchId) return m;
    }
    for (const r of b.consolationRounds ?? []) {
      for (const m of r.matches) if (m.id === matchId) return m;
    }
  }
  for (const g of t.groups ?? []) {
    for (const r of g.rounds) {
      for (const m of r.matches) if (m.id === matchId) return m;
    }
  }
  for (const j of t.jornadas ?? []) {
    for (const c of j.courts) {
      for (const m of c.matches) if (m.id === matchId) return m;
    }
  }
  return null;
}

export async function saveScore(
  tournamentId: string,
  matchId: string,
  sets: SetScore[],
): Promise<{ ok: boolean; error?: string }> {
  const t = await getTournament(tournamentId);
  if (!t) return { ok: false, error: "Torneo no encontrado." };

  const result = validateScore(t.scoreFormat, sets);
  if (!result.valid) return { ok: false, error: result.error };

  const m = findMatch(t, matchId);
  if (!m) return { ok: false, error: "Partido no encontrado." };
  m.score1 = result.score1;
  m.score2 = result.score2;
  m.sets = result.sets;
  m.status = "done";
  if (result.winner === 1 && !isPlaceholder(m.team1)) m.winnerId = m.team1.id;
  else if (result.winner === 2 && !isPlaceholder(m.team2))
    m.winnerId = m.team2.id;

  for (const b of t.brackets ?? []) {
    if (b.format === "elimination") {
      advanceElimination(b.rounds);
      if (b.consolationRounds) advanceConsolation(b.rounds, b.consolationRounds);
    }
  }

  return patchEngine(tournamentId, () => ({
    brackets: t.brackets,
    groups: t.groups,
    jornadas: t.jornadas,
    currentJornada: t.currentJornada,
  }));
}

export async function advanceJornada(
  tournamentId: string,
): Promise<{ ok: boolean; error?: string }> {
  const t = await getTournament(tournamentId);
  if (!t || !t.jornadas || !t.currentJornada) {
    return { ok: false, error: "No hay jornada activa." };
  }
  const current = t.jornadas[t.currentJornada - 1];
  if (!current) return { ok: false, error: "No hay jornada activa." };
  if (!jornadaComplete(current)) {
    return { ok: false, error: "Termina todos los partidos primero." };
  }
  current.done = true;
  const newOrder = applyPromotionRelegation(current);
  const nextJ = generateJornada(newOrder, t.groupSize, t.jornadas.length + 1);
  const jornadas = [...t.jornadas, nextJ];
  return patchEngine(tournamentId, () => ({
    jornadas,
    currentJornada: jornadas.length,
  }));
}

export async function setCurrentJornada(tournamentId: string, number: number) {
  await patchEngine(tournamentId, () => ({ currentJornada: number }));
}

// ── Contacts ─────────────────────────────────────────────────

export async function listContacts(): Promise<Contact[]> {
  const { data } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []).map(contactFromRow);
}

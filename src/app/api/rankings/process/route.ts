// POST /api/rankings/process  { tournamentId }
// Called when an organizer finishes a tournament. Feeds its results into the
// global player ranking. Idempotent (guarded by tournaments.ranked).

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { processTournamentRanking } from "@/lib/ranking/process";
import type { Tournament } from "@/lib/types";

export const runtime = "nodejs";

interface EngineBlob {
  brackets?: Tournament["brackets"];
  groups?: Tournament["groups"];
  jornadas?: Tournament["jornadas"];
}

export async function POST(request: NextRequest) {
  // Must be signed in and own the tournament.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const tournamentId = body.tournamentId as string | undefined;
  if (!tournamentId) {
    return NextResponse.json({ error: "Falta tournamentId." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("tournaments")
    .select("*")
    .eq("id", tournamentId)
    .maybeSingle();

  if (!row) {
    return NextResponse.json({ error: "Torneo no encontrado." }, { status: 404 });
  }
  if (row.organizer_id !== user.id) {
    return NextResponse.json({ error: "No es tu torneo." }, { status: 403 });
  }

  const engine = (row.engine as EngineBlob | null) ?? {};
  const tournament = {
    id: row.id,
    name: row.name,
    status: row.status,
    ranked: row.ranked ?? false,
    state: row.state ?? null,
    municipality: row.municipality ?? null,
    brackets: engine.brackets,
    groups: engine.groups,
    jornadas: engine.jornadas,
  } as unknown as Tournament & {
    ranked: boolean;
    state: string | null;
    municipality: string | null;
  };

  const result = await processTournamentRanking(admin, tournament);
  if (!result.ok && result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json(result);
}

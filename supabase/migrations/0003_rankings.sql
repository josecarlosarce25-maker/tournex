-- Tournex — sistema de ranking de jugadores (ELO), analíticas y grupos de amigos.
-- Convierte a Tournex de "torneos esporádicos" en producto recurrente.

-- ─────────────────────────────────────────────────────────────
-- players: jugador PERSISTENTE (vive entre torneos). Hoy las parejas
-- (teams) son efímeras; aquí cada jugador acumula rating e historial.
-- Se identifica por teléfono (fuerte) o nombre normalizado (débil).
-- ─────────────────────────────────────────────────────────────

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  normalized_name text not null,
  phone text,
  -- Geo (se hereda del torneo más reciente donde jugó; editable al reclamar).
  state text,
  municipality text,
  -- Si el jugador reclama su perfil con una cuenta.
  claimed_by uuid references auth.users(id) on delete set null,
  -- ELO.
  rating numeric not null default 1000,
  peak_rating numeric not null default 1000,
  matches_played integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  current_streak integer not null default 0, -- + racha ganadora, - perdedora
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_players_rating on players(rating desc);
create index if not exists idx_players_state on players(state);
create index if not exists idx_players_normalized on players(normalized_name);
create unique index if not exists idx_players_phone
  on players(phone) where phone is not null;

-- ─────────────────────────────────────────────────────────────
-- player_matches: una fila por jugador por partido jugado.
-- Alimenta analíticas: química de pareja, head-to-head, evolución.
-- ─────────────────────────────────────────────────────────────

create table if not exists player_matches (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade not null,
  partner_id uuid references players(id) on delete set null,
  opponent1_id uuid references players(id) on delete set null,
  opponent2_id uuid references players(id) on delete set null,
  tournament_id uuid references tournaments(id) on delete cascade,
  tournament_name text,
  category text,
  won boolean not null,
  score text,
  rating_before numeric not null,
  rating_after numeric not null,
  rating_delta numeric not null,
  played_at timestamptz default now()
);

create index if not exists idx_pm_player on player_matches(player_id);
create index if not exists idx_pm_partner on player_matches(partner_id);
create index if not exists idx_pm_tournament on player_matches(tournament_id);

-- ─────────────────────────────────────────────────────────────
-- friend_groups: ranking privado entre amigos (tu grupo de WhatsApp).
-- ─────────────────────────────────────────────────────────────

create table if not exists friend_groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

create table if not exists friend_group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references friend_groups(id) on delete cascade not null,
  player_id uuid references players(id) on delete cascade not null,
  added_at timestamptz default now(),
  unique (group_id, player_id)
);

create index if not exists idx_fgm_group on friend_group_members(group_id);

-- Flag en tournaments para no doble-contar resultados en el ranking.
alter table tournaments
  add column if not exists ranked boolean default false,
  add column if not exists state text,
  add column if not exists municipality text;

-- ─────────────────────────────────────────────────────────────
-- RLS
-- players + player_matches: lectura pública (ranking abierto), escritura
-- solo via service role (el endpoint de procesamiento). Un usuario puede
-- actualizar SU propio player si lo reclamó.
-- ─────────────────────────────────────────────────────────────

alter table players enable row level security;
alter table player_matches enable row level security;
alter table friend_groups enable row level security;
alter table friend_group_members enable row level security;

drop policy if exists "players public read" on players;
create policy "players public read" on players for select using (true);

drop policy if exists "player updates own claimed profile" on players;
create policy "player updates own claimed profile"
  on players for update using (auth.uid() = claimed_by);

drop policy if exists "player_matches public read" on player_matches;
create policy "player_matches public read"
  on player_matches for select using (true);

-- friend_groups: el dueño gestiona; lectura pública por slug (para unirse).
drop policy if exists "friend_groups public read" on friend_groups;
create policy "friend_groups public read"
  on friend_groups for select using (true);
drop policy if exists "friend_groups owner writes" on friend_groups;
create policy "friend_groups owner writes"
  on friend_groups for all using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "fg_members public read" on friend_group_members;
create policy "fg_members public read"
  on friend_group_members for select using (true);
drop policy if exists "fg_members owner writes" on friend_group_members;
create policy "fg_members owner writes"
  on friend_group_members for all using (
    exists (select 1 from friend_groups g
            where g.id = friend_group_members.group_id and g.owner_id = auth.uid())
  ) with check (
    exists (select 1 from friend_groups g
            where g.id = friend_group_members.group_id and g.owner_id = auth.uid())
  );

-- updated_at trigger for players (reuses touch_updated_at from 0002).
drop trigger if exists players_touch_updated_at on players;
create trigger players_touch_updated_at
  before update on players
  for each row execute function public.touch_updated_at();

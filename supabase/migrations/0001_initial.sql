-- Tournex — esquema inicial
-- Pega este archivo completo en Supabase > SQL Editor > New query > Run.

-- ─────────────────────────────────────────────────────────────
-- Tablas
-- ─────────────────────────────────────────────────────────────

create table if not exists organizers (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null,
  phone text,
  created_at timestamptz default now()
);

create table if not exists tournaments (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid references organizers(id) on delete cascade not null,
  slug text unique not null,
  name text not null,
  sport text default 'Pádel',
  location text,
  date date,
  days integer default 1,
  weeks integer default 8,
  is_liga boolean default false,
  format text not null default 'round_robin',
  score_format text default '8games',
  courts integer default 4,
  max_pairs integer,
  group_size integer default 3,
  min_matches integer,
  start_time time default '09:00',
  end_time time default '20:00',
  match_duration integer default 45,
  final_time time,
  dead_start time,
  dead_end time,
  price numeric,
  pay_link text,
  deadline date,
  consolation boolean default false,
  includes_shirt boolean default false,
  categories jsonb default '["General"]'::jsonb,
  status text default 'draft',
  -- Estructuras generadas (brackets, grupos, jornadas) como JSON.
  engine jsonb,
  created_at timestamptz default now()
);

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references tournaments(id) on delete cascade not null,
  name text not null,
  player1_name text not null,
  player1_phone text,
  player1_email text,
  player1_shirt_size text,
  player2_name text,
  player2_phone text,
  player2_email text,
  player2_shirt_size text,
  category text,
  status text default 'pending',
  registered_at timestamptz default now()
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references tournaments(id) on delete cascade not null,
  round integer,
  round_name text,
  group_name text,
  court text,
  scheduled_time time,
  team1_id uuid references teams(id) on delete set null,
  team2_id uuid references teams(id) on delete set null,
  score1 integer,
  score2 integer,
  sets jsonb,
  winner_id uuid references teams(id) on delete set null,
  status text default 'pending',
  jornada integer,
  consolation boolean default false,
  created_at timestamptz default now()
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid references organizers(id) on delete cascade not null,
  name text not null,
  phone text,
  email text,
  category text,
  tournaments_played text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists jornadas (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references tournaments(id) on delete cascade not null,
  number integer not null,
  court_assignments jsonb,
  done boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_tournaments_organizer on tournaments(organizer_id);
create index if not exists idx_tournaments_slug on tournaments(slug);
create index if not exists idx_teams_tournament on teams(tournament_id);
create index if not exists idx_matches_tournament on matches(tournament_id);
create index if not exists idx_contacts_organizer on contacts(organizer_id);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- El organizador solo ve/edita lo suyo. Las rutas públicas
-- (/t/[slug] y /reg/[slug]) leen torneos, equipos y partidos
-- sin login. La inscripción pública puede INSERTAR equipos.
-- ─────────────────────────────────────────────────────────────

alter table organizers enable row level security;
alter table tournaments enable row level security;
alter table teams enable row level security;
alter table matches enable row level security;
alter table contacts enable row level security;
alter table jornadas enable row level security;

-- organizers: cada quien su fila.
create policy "organizer reads own row"
  on organizers for select using (auth.uid() = id);
create policy "organizer inserts own row"
  on organizers for insert with check (auth.uid() = id);
create policy "organizer updates own row"
  on organizers for update using (auth.uid() = id);

-- tournaments: lectura pública (para links compartibles),
-- escritura solo del dueño.
create policy "tournaments are public to read"
  on tournaments for select using (true);
create policy "organizer inserts own tournaments"
  on tournaments for insert with check (auth.uid() = organizer_id);
create policy "organizer updates own tournaments"
  on tournaments for update using (auth.uid() = organizer_id);
create policy "organizer deletes own tournaments"
  on tournaments for delete using (auth.uid() = organizer_id);

-- teams: lectura pública; el dueño del torneo gestiona todo;
-- cualquiera puede INSERTAR (inscripción pública por link).
create policy "teams are public to read"
  on teams for select using (true);
create policy "anyone can register a team"
  on teams for insert with check (true);
create policy "organizer manages teams"
  on teams for update using (
    exists (
      select 1 from tournaments t
      where t.id = teams.tournament_id and t.organizer_id = auth.uid()
    )
  );
create policy "organizer deletes teams"
  on teams for delete using (
    exists (
      select 1 from tournaments t
      where t.id = teams.tournament_id and t.organizer_id = auth.uid()
    )
  );

-- matches: lectura pública; escritura solo del dueño.
create policy "matches are public to read"
  on matches for select using (true);
create policy "organizer manages matches"
  on matches for all using (
    exists (
      select 1 from tournaments t
      where t.id = matches.tournament_id and t.organizer_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from tournaments t
      where t.id = matches.tournament_id and t.organizer_id = auth.uid()
    )
  );

-- jornadas: lectura pública; escritura solo del dueño.
create policy "jornadas are public to read"
  on jornadas for select using (true);
create policy "organizer manages jornadas"
  on jornadas for all using (
    exists (
      select 1 from tournaments t
      where t.id = jornadas.tournament_id and t.organizer_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from tournaments t
      where t.id = jornadas.tournament_id and t.organizer_id = auth.uid()
    )
  );

-- contacts: privados del organizador.
create policy "organizer manages own contacts"
  on contacts for all using (auth.uid() = organizer_id)
  with check (auth.uid() = organizer_id);

-- ─────────────────────────────────────────────────────────────
-- Trigger: crea la fila en `organizers` al registrarse un usuario.
-- ─────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.organizers (id, name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- Realtime: emite cambios de `matches` para la vista de jugador.
-- ─────────────────────────────────────────────────────────────

alter publication supabase_realtime add table matches;
alter publication supabase_realtime add table teams;

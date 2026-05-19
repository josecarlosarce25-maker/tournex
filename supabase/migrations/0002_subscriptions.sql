-- Tournex — suscripciones de la propia plataforma (cobros de Pro/Club)
-- Pega este archivo completo en Supabase > SQL Editor > New query > Run.

-- ─────────────────────────────────────────────────────────────
-- Tabla `subscriptions`: una fila por organizador suscrito.
-- ─────────────────────────────────────────────────────────────

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid references organizers(id) on delete cascade not null,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  -- plan: 'pro' | 'club'
  plan text not null,
  -- billing: 'monthly' | 'annual'
  billing text not null default 'monthly',
  -- status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete'
  status text not null default 'incomplete',
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_subscriptions_organizer
  on subscriptions(organizer_id);
create index if not exists idx_subscriptions_stripe_customer
  on subscriptions(stripe_customer_id);

-- Columna en organizers para acceso rápido al plan actual.
alter table organizers
  add column if not exists subscription_plan text default 'free',
  add column if not exists subscription_status text default 'free';

-- RLS: cada organizador solo puede leer su propia suscripción.
-- La escritura siempre la hace el webhook con el service role (bypassea RLS).
alter table subscriptions enable row level security;

drop policy if exists "organizer reads own subscription" on subscriptions;
create policy "organizer reads own subscription"
  on subscriptions for select using (auth.uid() = organizer_id);

-- Trigger para mantener updated_at.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists subscriptions_touch_updated_at on subscriptions;
create trigger subscriptions_touch_updated_at
  before update on subscriptions
  for each row execute function public.touch_updated_at();

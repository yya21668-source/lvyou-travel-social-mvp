create extension if not exists "pgcrypto";

create type public.trip_visibility as enum ('public','friends','private');
create type public.trip_status as enum ('draft','planned','active','completed');
create type public.application_status as enum ('pending','accepted','rejected','cancelled');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  bio text,
  verified boolean not null default false,
  emergency_contact jsonb,
  followers_count integer not null default 0,
  following_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.trip_plans (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.users(id) on delete cascade,
  title text not null, destination text not null, start_date date, end_date date, trip_type text not null,
  visibility public.trip_visibility not null default 'private', status public.trip_status not null default 'draft',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.poi_items (
  id uuid primary key default gen_random_uuid(), trip_plan_id uuid not null references public.trip_plans(id) on delete cascade,
  day_index integer not null check(day_index >= 0), sort_order integer not null default 0, poi_name text not null,
  type text not null, description text, suggested_time time, reviews jsonb not null default '[]', opening_hours text,
  address text, phone text, external_url text, created_at timestamptz not null default now()
);

create table public.groups (
  id uuid primary key default gen_random_uuid(), trip_plan_id uuid not null unique references public.trip_plans(id) on delete cascade,
  name text not null, created_at timestamptz not null default now()
);
create table public.group_members (
  group_id uuid references public.groups(id) on delete cascade, user_id uuid references public.users(id) on delete cascade,
  role text not null default 'member', joined_at timestamptz not null default now(), primary key(group_id,user_id)
);
create table public.messages (
  id uuid primary key default gen_random_uuid(), group_id uuid not null references public.groups(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade, content text not null check(char_length(content) between 1 and 4000),
  created_at timestamptz not null default now()
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(), group_id uuid not null references public.groups(id) on delete cascade,
  payer_id uuid not null references public.users(id), title text not null, amount_minor bigint not null check(amount_minor > 0),
  currency char(3) not null, exchange_rate numeric(18,8), created_at timestamptz not null default now()
);
create table public.expense_splits (
  expense_id uuid references public.expenses(id) on delete cascade, user_id uuid references public.users(id),
  amount_minor bigint not null check(amount_minor >= 0), primary key(expense_id,user_id)
);

create table public.posts (
  id uuid primary key default gen_random_uuid(), author_id uuid not null references public.users(id) on delete cascade,
  trip_plan_id uuid references public.trip_plans(id) on delete set null, title text not null, content text not null,
  content_type text not null default 'travelogue', visibility public.trip_visibility not null default 'public',
  summary jsonb not null default '[]', likes_count integer not null default 0, published_at timestamptz default now()
);

create table public.match_applications (
  id uuid primary key default gen_random_uuid(), trip_plan_id uuid not null references public.trip_plans(id) on delete cascade,
  applicant_id uuid not null references public.users(id) on delete cascade, owner_id uuid not null references public.users(id) on delete cascade,
  message text, status public.application_status not null default 'pending', created_at timestamptz not null default now(),
  unique(trip_plan_id, applicant_id)
);
create table public.match_confirmations (
  application_id uuid references public.match_applications(id) on delete cascade, user_id uuid references public.users(id) on delete cascade,
  confirmed_at timestamptz not null default now(), primary key(application_id,user_id)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(), author_id uuid not null references public.users(id) on delete cascade,
  target_user_id uuid references public.users(id) on delete cascade, poi_item_id uuid references public.poi_items(id) on delete cascade,
  rating integer not null check(rating between 1 and 5), content text,
  created_at timestamptz not null default now(), check((target_user_id is not null) <> (poi_item_id is not null))
);

create index poi_items_trip_idx on public.poi_items(trip_plan_id, day_index, sort_order);
create index messages_group_created_idx on public.messages(group_id, created_at);
create index posts_visibility_published_idx on public.posts(visibility, published_at desc);

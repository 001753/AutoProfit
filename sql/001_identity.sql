create extension if not exists pgcrypto;
create table if not exists organization (
  id uuid primary key default gen_random_uuid(), name text not null check (length(trim(name)) >= 2),
  timezone text not null default 'Asia/Jakarta', currency char(3) not null default 'IDR',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table if not exists app_user (
  id uuid primary key default gen_random_uuid(), email text not null unique,
  password_hash text not null, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table if not exists membership (
  user_id uuid not null references app_user(id), org_id uuid not null references organization(id),
  role text not null check (role in ('Owner','Finance','Purchasing','Operations','Admin')),
  created_at timestamptz not null default now(), deleted_at timestamptz,
  primary key (user_id, org_id)
);
create table if not exists session (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references app_user(id),
  org_id uuid not null references organization(id), refresh_token_id uuid not null unique,
  created_at timestamptz not null default now(), revoked_at timestamptz
);
create index if not exists membership_org_idx on membership(org_id) where deleted_at is null;
create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references organization(id),
  actor_user_id uuid references app_user(id), action text not null, entity_type text not null,
  entity_id uuid, before_json jsonb, after_json jsonb, source text not null, created_at timestamptz not null default now()
);
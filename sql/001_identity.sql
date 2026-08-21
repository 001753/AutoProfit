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
create table if not exists permission (
  code text primary key, description text not null
);
create table if not exists role_permission (
  role text not null check (role in ('Owner','Finance','Purchasing','Operations','Admin')),
  permission_code text not null references permission(code),
  primary key (role, permission_code)
);
create table if not exists consent (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references app_user(id),
  org_id uuid not null references organization(id), policy_type text not null,
  policy_version text not null, accepted_at timestamptz not null default now(),
  source text not null, withdrawn_at timestamptz
);
insert into permission(code,description) values
  ('job:create','Create a background job'),
  ('session:revoke','Revoke an active session'),
  ('organization:manage','Manage organization settings')
on conflict (code) do nothing;
insert into role_permission(role,permission_code)
select role_name, permission_code from (values
  ('Owner','job:create'),('Owner','session:revoke'),('Owner','organization:manage'),
  ('Admin','job:create'),('Admin','session:revoke'),('Admin','organization:manage'),
  ('Operations','job:create')
) as seed(role_name,permission_code)
on conflict do nothing;
create table if not exists job_queue (
  id uuid primary key default gen_random_uuid(),
  queue_name text not null,
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending','processing','done','failed','dead')),
  attempts integer not null default 0,
  max_attempts integer not null default 3,
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  locked_by text,
  last_error text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists job_queue_claim_idx on job_queue(queue_name, available_at, created_at)
  where status in ('pending','failed');
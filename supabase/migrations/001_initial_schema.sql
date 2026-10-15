-- Parent Portal: Initial Schema
-- Families, users, children, schedule items, events, comments, attachments

-- ── Enums ────────────────────────────────────────────────────────────

create type user_role as enum ('parent', 'child');
create type item_status as enum ('pending', 'in_progress', 'done', 'skipped');
create type attachment_parent_type as enum ('schedule_item', 'event', 'comment');
create type comment_parent_type as enum ('schedule_item', 'event');
create type item_category as enum ('routine', 'hygiene', 'meal', 'school', 'activity', 'social', 'appointment', 'chore', 'free_time', 'other');

-- ── Families ─────────────────────────────────────────────────────────

create table families (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'My Family',
  created_at timestamptz not null default now()
);

-- ── Profiles (extends Supabase auth.users) ───────────────────────────

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
  role user_role not null default 'parent',
  display_name text not null,
  email text not null,
  avatar_url text,
  -- Notification preferences (jsonb)
  notification_prefs jsonb not null default '{
    "email_digest": true,
    "push_enabled": true,
    "daily_lookahead": true,
    "weekly_summary": false,
    "quiet_hours_start": "21:00",
    "quiet_hours_end": "07:00"
  }'::jsonb,
  -- Low-stim mode toggle
  low_stim_mode boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Children ─────────────────────────────────────────────────────────

create table children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  display_name text not null,
  avatar_url text,
  date_of_birth date,
  -- Parental consent record
  consent_given_at timestamptz not null default now(),
  consent_given_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Routine Templates ────────────────────────────────────────────────
-- Recurring daily structure: "every Monday at 07:00, brush teeth"

create table routine_templates (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  title text not null,
  description text,
  category item_category not null default 'routine',
  sort_order smallint not null default 0,
  is_active boolean not null default true,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Schedule Items ───────────────────────────────────────────────────
-- Date-specific instances (generated from templates or added manually)

create table schedule_items (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  title text not null,
  description text,
  category item_category not null default 'routine',
  status item_status not null default 'pending',
  template_id uuid references routine_templates(id) on delete set null,
  created_by uuid references profiles(id),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Events ───────────────────────────────────────────────────────────

create table events (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time,
  title text not null,
  description text,
  location text,
  category item_category not null default 'activity',
  recurrence_rule text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Comments ─────────────────────────────────────────────────────────

create table comments (
  id uuid primary key default gen_random_uuid(),
  parent_type comment_parent_type not null,
  parent_id uuid not null,
  author_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Attachments ──────────────────────────────────────────────────────

create table attachments (
  id uuid primary key default gen_random_uuid(),
  parent_type attachment_parent_type not null,
  parent_id uuid not null,
  file_url text not null,
  file_type text not null,
  file_name text not null,
  file_size bigint not null default 0,
  uploaded_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ── Indexes ──────────────────────────────────────────────────────────

create index idx_profiles_family on profiles(family_id);
create index idx_children_family on children(family_id);
create index idx_routine_templates_child on routine_templates(child_id, day_of_week);
create index idx_schedule_items_child_date on schedule_items(child_id, date);
create index idx_events_child_date on events(child_id, date);
create index idx_comments_parent on comments(parent_type, parent_id);
create index idx_attachments_parent on attachments(parent_type, parent_id);

-- ── Updated_at trigger ───────────────────────────────────────────────

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated before update on profiles
  for each row execute function update_updated_at();
create trigger trg_children_updated before update on children
  for each row execute function update_updated_at();
create trigger trg_routine_templates_updated before update on routine_templates
  for each row execute function update_updated_at();
create trigger trg_schedule_items_updated before update on schedule_items
  for each row execute function update_updated_at();
create trigger trg_events_updated before update on events
  for each row execute function update_updated_at();
create trigger trg_comments_updated before update on comments
  for each row execute function update_updated_at();

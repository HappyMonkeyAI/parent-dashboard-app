-- Parent Portal: Row Level Security Policies
-- Family-scoped data isolation: parents see their family, children see only their own data

-- ── Enable RLS ───────────────────────────────────────────────────────

alter table families enable row level security;
alter table profiles enable row level security;
alter table children enable row level security;
alter table routine_templates enable row level security;
alter table schedule_items enable row level security;
alter table events enable row level security;
alter table comments enable row level security;
alter table attachments enable row level security;

-- ── Helper: get current user's family_id ─────────────────────────────

create or replace function get_family_id()
returns uuid as $$
  select family_id from profiles where id = auth.uid();
$$ language sql stable security definer;

-- ── Helper: get current user's role ──────────────────────────────────

create or replace function get_user_role()
returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql stable security definer;

-- ── Helper: check if user is parent in family ────────────────────────

create or replace function is_parent_in_family(f_id uuid)
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and family_id = f_id and role = 'parent'
  );
$$ language sql stable security definer;

-- ── Families ─────────────────────────────────────────────────────────

create policy "Parents can view their family"
  on families for select
  using (is_parent_in_family(id));

create policy "Parents can update their family"
  on families for update
  using (is_parent_in_family(id));

-- ── Profiles ─────────────────────────────────────────────────────────

create policy "Users can view profiles in their family"
  on profiles for select
  using (family_id = get_family_id());

create policy "Users can update their own profile"
  on profiles for update
  using (id = auth.uid());

create policy "Parents can insert profiles"
  on profiles for insert
  with check (
    -- A parent can create a child profile in their family
    (get_user_role() = 'parent' and family_id = get_family_id())
    -- Or a user creates their own profile (during onboarding)
    or id = auth.uid()
  );

-- ── Children ─────────────────────────────────────────────────────────

create policy "Parents can manage children in their family"
  on children for all
  using (is_parent_in_family(family_id))
  with check (is_parent_in_family(family_id));

create policy "Children can view their own record"
  on children for select
  using (profile_id = auth.uid());

-- ── Routine Templates ────────────────────────────────────────────────

create policy "Parents can manage routine templates"
  on routine_templates for all
  using (is_parent_in_family(
    (select family_id from children where id = child_id)
  ))
  with check (is_parent_in_family(
    (select family_id from children where id = child_id)
  ));

create policy "Children can view their routine templates"
  on routine_templates for select
  using (
    (select profile_id from children where id = child_id) = auth.uid()
  );

-- ── Schedule Items ───────────────────────────────────────────────────

create policy "Parents can manage schedule items"
  on schedule_items for all
  using (is_parent_in_family(
    (select family_id from children where id = child_id)
  ))
  with check (is_parent_in_family(
    (select family_id from children where id = child_id)
  ));

create policy "Children can view their schedule items"
  on schedule_items for select
  using (
    (select profile_id from children where id = child_id) = auth.uid()
  );

create policy "Children can update their schedule item status"
  on schedule_items for update
  using (
    (select profile_id from children where id = child_id) = auth.uid()
  )
  with check (
    (select profile_id from children where id = child_id) = auth.uid()
  );

create policy "Children can add their own schedule items"
  on schedule_items for insert
  with check (
    (select profile_id from children where id = child_id) = auth.uid()
  );

-- ── Events ───────────────────────────────────────────────────────────

create policy "Parents can manage events"
  on events for all
  using (is_parent_in_family(
    (select family_id from children where id = child_id)
  ))
  with check (is_parent_in_family(
    (select family_id from children where id = child_id)
  ));

create policy "Children can view their events"
  on events for select
  using (
    (select profile_id from children where id = child_id) = auth.uid()
  );

-- ── Comments ─────────────────────────────────────────────────────────
-- Comments are on schedule_items or events; access depends on the parent record

create policy "Family members can view comments on their items"
  on comments for select
  using (
    case parent_type
      when 'schedule_item' then exists (
        select 1 from schedule_items si
        join children c on c.id = si.child_id
        where si.id = parent_id
        and (is_parent_in_family(c.family_id) or c.profile_id = auth.uid())
      )
      when 'event' then exists (
        select 1 from events e
        join children c on c.id = e.child_id
        where e.id = parent_id
        and (is_parent_in_family(c.family_id) or c.profile_id = auth.uid())
      )
    end
  );

create policy "Family members can add comments to their items"
  on comments for insert
  with check (
    author_id = auth.uid()
    and case parent_type
      when 'schedule_item' then exists (
        select 1 from schedule_items si
        join children c on c.id = si.child_id
        where si.id = parent_id
        and (is_parent_in_family(c.family_id) or c.profile_id = auth.uid())
      )
      when 'event' then exists (
        select 1 from events e
        join children c on c.id = e.child_id
        where e.id = parent_id
        and (is_parent_in_family(c.family_id) or c.profile_id = auth.uid())
      )
    end
  );

-- ── Attachments ──────────────────────────────────────────────────────

create policy "Family members can view attachments on their items"
  on attachments for select
  using (
    case parent_type
      when 'schedule_item' then exists (
        select 1 from schedule_items si
        join children c on c.id = si.child_id
        where si.id = parent_id
        and (is_parent_in_family(c.family_id) or c.profile_id = auth.uid())
      )
      when 'event' then exists (
        select 1 from events e
        join children c on c.id = e.child_id
        where e.id = parent_id
        and (is_parent_in_family(c.family_id) or c.profile_id = auth.uid())
      )
      when 'comment' then exists (
        select 1 from comments cm
        where cm.id = parent_id
        and (
          -- Check if user can see the comment's parent
          true -- simplified; comment visibility follows parent item visibility
        )
      )
    end
  );

create policy "Family members can upload attachments to their items"
  on attachments for insert
  with check (uploaded_by = auth.uid());

create policy "Uploaders can delete their own attachments"
  on attachments for delete
  using (uploaded_by = auth.uid());

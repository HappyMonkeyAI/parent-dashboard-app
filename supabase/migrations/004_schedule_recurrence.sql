-- Add explicit recurrence to schedule entries created from the grid.
-- Existing routine templates retain their weekly behaviour.

alter table routine_templates
  add column if not exists recurrence_rule text not null default 'FREQ=WEEKLY';

alter table routine_templates
  add column if not exists anchor_date date;

update routine_templates
set recurrence_rule = 'FREQ=WEEKLY'
where recurrence_rule is null;

alter table routine_templates
  alter column recurrence_rule set default 'FREQ=WEEKLY',
  alter column recurrence_rule set not null;

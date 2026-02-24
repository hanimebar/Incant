-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  tier text not null default 'free' check (tier in ('free', 'caster', 'wizard')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  app_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  base_username text;
  final_username text;
  counter integer := 0;
begin
  base_username := lower(split_part(new.email, '@', 1));
  base_username := regexp_replace(base_username, '[^a-z0-9]', '', 'g');
  if length(base_username) < 3 then
    base_username := 'user';
  end if;
  final_username := base_username;
  loop
    exit when not exists (select 1 from public.profiles where username = final_username);
    counter := counter + 1;
    final_username := base_username || counter::text;
  end loop;
  insert into public.profiles (id, username) values (new.id, final_username);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- SPELLS (user-created apps)
-- ============================================================
create table if not exists public.spells (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  slug text not null,
  name text not null,
  template_id text not null,
  config jsonb not null default '{}',
  is_public boolean not null default true,
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, slug)
);

-- Auto-update app_count on profiles
create or replace function public.update_app_count()
returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then
    update public.profiles set app_count = app_count + 1 where id = new.user_id;
  elsif tg_op = 'DELETE' then
    update public.profiles set app_count = greatest(0, app_count - 1) where id = old.user_id;
  end if;
  return null;
end;
$$;

drop trigger if exists on_spell_change on public.spells;
create trigger on_spell_change
  after insert or delete on public.spells
  for each row execute procedure public.update_app_count();

-- ============================================================
-- TEMPLATES (static reference data)
-- ============================================================
create table if not exists public.templates (
  id text primary key,
  name text not null,
  category text not null,
  description text not null,
  icon text not null,
  sort_order integer not null default 0
);

insert into public.templates (id, name, category, description, icon, sort_order) values
  ('habit-tracker',   'Habit Tracker',     'Trackers',    'Track daily habits and streaks',                    '✅', 1),
  ('water-intake',    'Water Intake',      'Trackers',    'Log your daily water consumption',                  '💧', 2),
  ('mood-tracker',    'Mood Tracker',      'Trackers',    'Record your mood throughout the day',               '😊', 3),
  ('workout-log',     'Workout Log',       'Trackers',    'Log exercises, sets, and reps',                     '💪', 4),
  ('sleep-tracker',   'Sleep Tracker',     'Trackers',    'Track sleep duration and quality',                  '😴', 5),
  ('expense-logger',  'Expense Logger',    'Finance',     'Log and categorize your spending',                  '💸', 6),
  ('tip-calculator',  'Tip Calculator',    'Finance',     'Calculate tips and split bills',                    '🧮', 7),
  ('bill-splitter',   'Bill Splitter',     'Finance',     'Split expenses among friends',                      '🍕', 8),
  ('savings-goal',    'Savings Goal',      'Finance',     'Track progress toward a savings target',            '🏦', 9),
  ('todo-list',       'To-Do List',        'Productivity','Simple task management',                            '📋', 10),
  ('reading-list',    'Reading List',      'Productivity','Track books to read and finished',                  '📚', 11),
  ('link-saver',      'Link Saver',        'Productivity','Save and organize useful links',                    '🔗', 12),
  ('daily-journal',   'Daily Journal',     'Productivity','Write daily journal entries',                       '📓', 13),
  ('goal-tracker',    'Goal Tracker',      'Productivity','Set and track progress on goals',                   '🎯', 14),
  ('quiz-builder',    'Quiz Builder',      'Social/Fun',  'Create and take custom quizzes',                    '❓', 15),
  ('countdown-timer', 'Countdown Timer',   'Social/Fun',  'Countdown to an important date',                    '⏱️', 16),
  ('form-survey',     'Form / Survey',     'Social/Fun',  'Collect responses with a simple form',              '📝', 17),
  ('flashcard-deck',  'Flashcard Deck',    'Social/Fun',  'Study with custom flashcards',                      '🃏', 18),
  ('data-table',      'Data Table',        'Custom',      'Simple spreadsheet-style data entry',               '📊', 19),
  ('custom-reminder', 'Custom Reminder',   'Custom',      'Set recurring reminders for anything',              '🔔', 20)
on conflict (id) do nothing;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Profiles
alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id);

-- Spells
alter table public.spells enable row level security;

create policy "Public spells are viewable by anyone"
  on public.spells for select
  using (is_public = true or auth.uid() = user_id);

create policy "Spells are insertable by owner"
  on public.spells for insert
  with check (auth.uid() = user_id);

create policy "Spells are updatable by owner"
  on public.spells for update
  using (auth.uid() = user_id);

create policy "Spells are deletable by owner"
  on public.spells for delete
  using (auth.uid() = user_id);

-- Templates (public read)
alter table public.templates enable row level security;

create policy "Templates are viewable by anyone"
  on public.templates for select
  using (true);

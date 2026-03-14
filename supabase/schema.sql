create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text not null default 'Learner',
  japanese_level text check (japanese_level in ('complete-beginner', 'beginner', 'lower-intermediate')),
  learning_goal text check (learning_goal in ('travel', 'daily-conversation', 'work', 'jlpt-support')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id text primary key,
  title text not null,
  category text not null,
  difficulty text not null check (difficulty in ('complete-beginner', 'beginner', 'lower-intermediate')),
  lesson_goal text not null,
  explanation_ko text not null,
  estimated_minutes integer not null default 5,
  key_expressions jsonb not null default '[]'::jsonb,
  mini_dialogue jsonb not null default '[]'::jsonb,
  practice_prompts jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_expressions (
  id uuid primary key default gen_random_uuid(),
  lesson_id text not null references public.lessons (id) on delete cascade,
  japanese text not null,
  reading text not null,
  meaning_ko text not null,
  notes_ko text not null,
  sort_order integer not null default 0
);

create table if not exists public.lesson_dialogues (
  id uuid primary key default gen_random_uuid(),
  lesson_id text not null references public.lessons (id) on delete cascade,
  speaker text not null check (speaker in ('staff', 'learner')),
  japanese text not null,
  reading text not null,
  meaning_ko text not null,
  sort_order integer not null default 0
);

create table if not exists public.practice_attempts (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null references public.lessons (id) on delete cascade,
  prompt_id text not null,
  answer text not null,
  input_mode text not null check (input_mode in ('text', 'voice')),
  feedback jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.review_items (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null references public.lessons (id) on delete cascade,
  expression text not null,
  meaning_ko text not null,
  state text not null check (state in ('new', 'weak', 'improving', 'mastered')),
  last_score integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_progress (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  attempts_count integer not null default 0,
  completed_lessons integer not null default 0,
  average_score integer not null default 0,
  unique (user_id, date)
);

create table if not exists public.streaks (
  id text primary key,
  user_id uuid not null unique references auth.users (id) on delete cascade,
  current_streak integer not null default 0,
  best_streak integer not null default 0,
  last_practice_date date
);

create table if not exists public.study_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  favorite_word_ids text[] not null default '{}',
  mastered_word_ids text[] not null default '{}',
  today_word_ids text[] not null default '{}',
  favorite_sentence_ids text[] not null default '{}',
  mastered_sentence_ids text[] not null default '{}',
  today_sentence_ids text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.practice_attempts enable row level security;
alter table public.review_items enable row level security;
alter table public.daily_progress enable row level security;
alter table public.streaks enable row level security;
alter table public.study_preferences enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_expressions enable row level security;
alter table public.lesson_dialogues enable row level security;

drop policy if exists "profiles-own-row" on public.profiles;
drop policy if exists "practice-own-row" on public.practice_attempts;
drop policy if exists "review-own-row" on public.review_items;
drop policy if exists "daily-progress-own-row" on public.daily_progress;
drop policy if exists "streaks-own-row" on public.streaks;
drop policy if exists "study-preferences-own-row" on public.study_preferences;
drop policy if exists "lessons-readable" on public.lessons;
drop policy if exists "lesson-expressions-readable" on public.lesson_expressions;
drop policy if exists "lesson-dialogues-readable" on public.lesson_dialogues;

create policy "profiles-own-row" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "practice-own-row" on public.practice_attempts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "review-own-row" on public.review_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "daily-progress-own-row" on public.daily_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "streaks-own-row" on public.streaks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "study-preferences-own-row" on public.study_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "lessons-readable" on public.lessons for select using (true);
create policy "lesson-expressions-readable" on public.lesson_expressions for select using (true);
create policy "lesson-dialogues-readable" on public.lesson_dialogues for select using (true);

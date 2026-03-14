# Kotoba Speak MVP

Kotoba Speak is a mobile-first Japanese speaking practice app for Korean learners. It focuses on short scenario drills, easy-to-read structured feedback, weak-expression review, and simple progress tracking.

This MVP is intentionally simple:

- Frontend: Next.js App Router + TypeScript + Tailwind CSS
- Backend: Supabase Auth + Supabase Postgres
- Deployment: Vercel Hobby
- Voice input: browser Web Speech API only
- Feedback: deterministic rule-based engine, with an optional LLM hook left disabled unless you later add an API key

## What the app does

- Email sign up and log in with Supabase Auth
- Guest/demo mode for testing without setup
- Onboarding for level and learning goal
- Dashboard with recommended lesson, streak, completed lessons, average score, and recent weak expressions
- 20+ seeded scenario lessons
- Text answers and optional voice-to-text input
- Structured feedback after each answer
- Weak-expression review list
- Progress tracking for attempts, scores, daily progress, and streaks

## Why this architecture is simple

- The app is mostly a client-side Next.js experience, so there is very little backend code to maintain.
- Supabase handles auth and storage, which avoids building a custom server.
- Voice is browser-only, so there are no speech-processing costs.
- The feedback engine is deterministic and local, so the MVP works without paid AI APIs.
- Seed lessons are bundled in code for reliability, and SQL files are included for Supabase setup.

## Folder structure

```text
app/
  (app)/
    dashboard/
    lessons/
    profile/
    review/
  api/feedback/
components/
  auth/
  dashboard/
  layout/
  lesson/
  profile/
  review/
hooks/
lib/
  demo/
  feedbackEngine/
  supabase/
  utils/
supabase/
  schema.sql
  seed.sql
tests/
```

## Important files

- `app/page.tsx`: entry screen for auth and onboarding
- `app/(app)/*`: main logged-in app screens
- `app/api/feedback/route.ts`: feedback endpoint
- `components/auth/app-provider.tsx`: app state, guest mode, Supabase sync
- `components/lesson/lesson-practice-screen.tsx`: practice flow
- `hooks/use-voice-input.ts`: browser speech-to-text wrapper
- `lib/demo/lessons.ts`: bundled lesson content
- `lib/feedbackEngine/ruleBasedEngine.ts`: deterministic scoring logic
- `supabase/schema.sql`: database schema and policies
- `supabase/seed.sql`: starter lesson rows

## Local install

1. Install dependencies:

```bash
npm install
```

2. Copy env file:

```bash
cp .env.example .env.local
```

3. Add your Supabase project values if you want real auth and persistence:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

4. Start the app:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

If you do not add Supabase env vars yet, guest mode still works and lets you test the whole flow in one browser.

## How to connect Supabase

1. Create a free Supabase project.
2. Open the SQL editor.
3. Run [`supabase/schema.sql`](/Users/juna/codex_juna/일본어/supabase/schema.sql).
4. Run [`supabase/seed.sql`](/Users/juna/codex_juna/일본어/supabase/seed.sql).
5. In Supabase Auth, enable Email auth.
6. Copy the project URL and anon key into `.env.local`.

## Database tables explained

- `profiles`: learner profile, onboarding answers, and basic display info
- `lessons`: lesson metadata plus JSON seed content for prompts, dialogue, and expressions
- `lesson_expressions`: normalized key-expression rows for future admin tooling or analytics
- `lesson_dialogues`: normalized mini-dialogue rows for future querying
- `practice_attempts`: every submitted answer plus its structured feedback
- `review_items`: weak or improving expressions that should be revisited
- `daily_progress`: per-day attempt counts, completed lessons, and average score
- `streaks`: current streak, best streak, and last practice date

## Free-tier reality

What is free in this MVP:

- Next.js on Vercel Hobby
- Supabase free tier for auth and Postgres
- Browser voice input through the user’s device
- Rule-based feedback engine

What may cost money later:

- Higher Supabase usage if many users join
- Paid AI feedback if you replace the rule-based engine with LLM scoring
- Advanced speech features like pronunciation scoring or server audio processing

## Deployment on Vercel

1. Push this project to GitHub.
2. Create a Vercel project and import the repo.
3. Add these environment variables in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
OPENAI_API_KEY=
```

4. Deploy.

The app does not require cron jobs, queues, WebSockets, or heavy storage for the MVP.

## Voice feature notes

- Voice input uses `SpeechRecognition` in the browser only.
- Chrome and Edge are the priority browsers.
- Unsupported browsers fall back to text input automatically.
- The app does not store or upload audio.
- This MVP does not do pronunciation scoring.

## How feedback works today

The current engine checks:

- overlap with the target answer
- whether key expressions are present
- simple sentence-length heuristics
- a few lightweight grammar hints like polite endings and particle presence

This keeps the app cheap, fast, and predictable for MVP testing.

## How to add real AI feedback later

The project already includes:

- `lib/feedbackEngine/ruleBasedEngine.ts`
- `lib/feedbackEngine/optionalLLMEngine.ts`
- `lib/feedbackEngine/index.ts`

To upgrade later:

1. Replace the stub in `optionalLLMEngine.ts`
2. Call your chosen LLM only when `OPENAI_API_KEY` exists
3. Keep the same response shape so the UI does not need to change
4. Use the rule-based engine as a fallback if the AI request fails

## How to add richer voice later

If you later want more advanced voice features, the simplest next steps are:

1. Add client-side recording for playback practice
2. Add pronunciation comparison only for selected premium flows
3. Use a paid speech API only if user demand proves it is worth the cost

For MVP, the current browser-only speech-to-text approach is the right tradeoff.

## Testing

Run:

```bash
npm run typecheck
npm run test
npm run build
```

## Notes for a non-technical founder

- Guest mode is your fastest way to test the full product without setup.
- Supabase setup is the only required backend step.
- Lesson content is easy to edit in [`lib/demo/lessons.ts`](/Users/juna/codex_juna/일본어/lib/demo/lessons.ts).
- If something feels too complex, keep the rule-based feedback and browser voice input for longer. They are the reason this MVP stays cheap and maintainable.

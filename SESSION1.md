# Session 1: Project Setup + Database — Done

## Deliverables

- **Next.js 15** project with TypeScript, Tailwind, shadcn/ui
- **Supabase** client (`src/lib/supabase/client.ts`), server (`src/lib/supabase/server.ts`), middleware helper (`src/lib/supabase/middleware.ts`), and root `src/middleware.ts`
- **6 SQL migrations** in `supabase/migrations/` (run in order):
  1. `20250216000001_belt_config.sql` — belt levels + seed data
  2. `20250216000002_profiles.sql` — profiles + RLS + auth trigger
  3. `20250216000003_families.sql` — topic families
  4. `20250216000004_debate_sessions.sql` — debate session records
  5. `20250216000005_skill_scores.sql` — per-user, per-family scores
  6. `20250216000006_learning_tracks.sql` — learning paths
- **Types**: `src/types/database.ts` (BeltConfig, Profile, Family, DebateSession, SkillScore, LearningTrack, Database)
- **Constants**: `src/lib/constants.ts` (OPPONENT_PERSONAS, BELT_LEVELS, DIFFICULTY_LEVELS, THEOLOGICAL_GUARDRAILS)
- **Env template**: `.env.example`

## Test Criteria

### 1. Project runs locally

```bash
cp .env.example .env.local
# Edit .env.local with your Supabase URL and anon key
npm run dev
```

Open http://localhost:3000 — app should load.

### 2. Migrations in Supabase

1. In [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**.
2. Run each migration file in order (1 → 6). Each should complete without error.
3. **Table Editor**: confirm tables `belt_config`, `profiles`, `families`, `debate_sessions`, `skill_scores`, `learning_tracks` exist.

### 3. RLS verification

In SQL Editor (while signed in or using anon key):

```sql
-- Belts and families: readable by all
select * from belt_config limit 1;
select * from families limit 1;

-- belt_config should be seeded (8 rows)
select count(*) from belt_config;
```

After enabling Auth and creating a user, test profile RLS:

```sql
-- As that user (or via app): insert/update own profile only
-- Other users cannot update your profile
```

### 4. Belt_config seed

After running `20250216000001_belt_config.sql`, run:

```sql
select id, name, level, min_score_threshold from belt_config order by level;
```

You should see 8 rows (White through Black) with the default thresholds.

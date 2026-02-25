# Session 2: Authenticated Shell + Debate Bootstrap

## Deliverables

- Expanded authenticated dashboard at `/dashboard`
  - Profile and current belt card
  - Start Debate form (family, difficulty, opponent persona)
  - Recent sessions panel
  - Skill snapshot panel
- `startDebateSession` server action in `src/app/actions/debate.ts`
- Debate session route at `/debate/[sessionId]`
  - Verifies session ownership
  - Displays session metadata
- Profile bootstrap logic
  - Ensures `profiles` row exists for signed-in user
  - Assigns default belt if missing
- Seed migration for curriculum data
  - `supabase/migrations/20250216000007_seed_reference_data.sql`

## Test Checklist

1. Run migration `20250216000007_seed_reference_data.sql` in Supabase SQL Editor.
2. Sign in at `/signin` using a test account.
3. Confirm redirect to `/dashboard`.
4. In dashboard:
   - Profile card shows account data.
   - Start Debate form has family options.
5. Start a session:
   - Submit form.
   - Confirm redirect to `/debate/<session-id>`.
6. Return to `/dashboard`:
   - New session appears in Recent sessions.


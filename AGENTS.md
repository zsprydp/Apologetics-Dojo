# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Apologetics Dojo (`adojo`) is a Next.js 16 (App Router) web app for Christian apologetics debate training. It uses Supabase for auth and database (PostgreSQL + RLS). Single-service frontend — no microservices, no Docker in the app itself.

### Running the app

Standard commands are in `package.json`:

- **Dev server:** `npm run dev` (port 3000)
- **Build:** `npm run build`
- **Lint:** `npx eslint .` (pre-existing lint warnings exist in `scripts/seed-test-users.cjs` and `src/lib/supabase/middleware.ts`)

### Local Supabase (required)

The app requires a running Supabase instance. For local dev, use the Supabase CLI via Docker:

1. Ensure Docker is running (`sudo dockerd` if needed; socket at `/var/run/docker.sock` must be readable — `sudo chmod 666 /var/run/docker.sock`).
2. `npx supabase start` — pulls images and starts all services; applies migrations from `supabase/migrations/` automatically.
3. Retrieve keys: `npx supabase status -o env` gives `ANON_KEY`, `API_URL`, and `SERVICE_ROLE_KEY`.
4. Create `.env.local` in project root with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY from step 3>
   SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY from step 3>
   ```

### OpenAI (required for AI debate)

The debate chat feature requires an OpenAI API key. Add `OPENAI_API_KEY` to `.env.local`. The app uses `gpt-4o-mini` via the Vercel AI SDK (`ai` + `@ai-sdk/openai` + `@ai-sdk/react`).

### Cloud Supabase

A Supabase Cloud project is set up at `edqbzgzenofobwsbhtiq.supabase.co` with all 9 migrations applied. Cloud credentials are available as secrets (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_PASSWORD`). To switch the dev server to cloud, update `.env.local` with the cloud URL and keys.

Direct psql to the cloud DB does not work from this VM (host is IPv6-only, pooler region mismatch). Use the Supabase JS client (service role key) or the Supabase Dashboard SQL Editor for admin queries. The Supabase CLI `link`/`db push` require a `SUPABASE_ACCESS_TOKEN` (personal access token from dashboard account settings) which is not currently configured.

### Testing

- `npm test` — runs 39 Vitest unit tests (prompts, scoring schema, constants, curriculum, utilities)
- `npm run build` — production build, verifies TypeScript and route compilation

### Deployment

See `DEPLOY.md` for the full Vercel + Supabase Cloud deployment guide. `vercel.json` is configured with 60s function timeouts and a weekly cron for digest emails.

### Optional integrations

All opt-in via env vars (app works without them):
- **Resend** (`RESEND_API_KEY`) — welcome emails + weekly digest cron
- **PostHog** (`NEXT_PUBLIC_POSTHOG_KEY`) — user analytics
- **Stripe** (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`) — Pro plan billing

### Gotchas

- Docker in this Cloud VM environment requires `fuse-overlayfs` storage driver and `iptables-legacy`. The Docker daemon config at `/etc/docker/daemon.json` must set `"storage-driver": "fuse-overlayfs"`.
- `npx supabase start` can take 1-2 minutes on first run (pulls ~15 container images). Subsequent starts are fast.
- The `supabase/config.toml` is committed in the repo; `supabase init` is not needed.
- Email confirmation is disabled in local Supabase (`enable_confirmations = false` in config.toml), so signup works immediately without email verification.
- `.env.local` is gitignored and must be created per environment.
- After a `supabase db reset`, all user accounts are wiped — you must re-signup.
- When killing the dev server, always verify the `next-server` process is gone (`netstat -tlnp | grep 3000` or `lsof -i:3000`) before restarting; stale processes cause port conflicts and `.next/dev/lock` errors.
- Supabase Cloud rate-limits signups to ~2-3/hour per IP. Use the admin API (`supabase.auth.admin.createUser`) to bypass for testing.

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

### Gotchas

- Docker in this Cloud VM environment requires `fuse-overlayfs` storage driver and `iptables-legacy`. The Docker daemon config at `/etc/docker/daemon.json` must set `"storage-driver": "fuse-overlayfs"`.
- `npx supabase start` can take 1-2 minutes on first run (pulls ~15 container images). Subsequent starts are fast.
- The `supabase/config.toml` is committed in the repo; `supabase init` is not needed.
- Email confirmation is disabled in local Supabase (`enable_confirmations = false` in config.toml), so signup works immediately without email verification.
- `.env.local` is gitignored and must be created per environment.
- After a `supabase db reset`, all user accounts are wiped — you must re-signup.
- When killing the dev server, always verify the `next-server` process is gone (`netstat -tlnp | grep 3000` or `lsof -i:3000`) before restarting; stale processes cause port conflicts and `.next/dev/lock` errors.

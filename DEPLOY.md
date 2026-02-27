# Deployment Guide — Apologetics Dojo

## Prerequisites

- A [Supabase](https://supabase.com) account (free tier works)
- A [Vercel](https://vercel.com) account (free Hobby plan works)
- An [OpenAI](https://platform.openai.com) API key with credits

## Step 1: Create a Supabase Cloud Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project.
2. Note the **Project URL** and **anon key** from **Settings → API**.
3. Note the **service_role key** (same page) — you'll need this for the seed script.

### Apply migrations

Option A — **Supabase CLI** (recommended):

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Option B — **SQL Editor**: Open each file in `supabase/migrations/` (in order `000001` through `000008`) and run them in the Supabase SQL Editor.

### Disable email confirmations (optional, for testing)

In **Authentication → Email Templates → Confirm signup**, you can toggle off "Enable email confirmations" for faster testing. Re-enable before going live.

## Step 2: Deploy to Vercel

1. Push this repo to GitHub (if not already).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Set the following **Environment Variables** in Vercel:

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_REF.supabase.co` | From Supabase dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | From Supabase Settings → API |
| `OPENAI_API_KEY` | `sk-...` | From OpenAI platform |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Optional — only for seed scripts |

4. Click **Deploy**. Vercel will build and deploy automatically.

### Function timeouts

The `vercel.json` in this repo configures 60-second timeouts for the AI chat and scoring routes. This requires Vercel Pro plan for production. On the free Hobby plan, the max is 10 seconds — AI responses may time out. Consider upgrading if needed.

## Step 3: Verify

1. Visit your Vercel deployment URL.
2. Create an account via the signup page.
3. Start a debate session and verify AI responses stream correctly.
4. End the debate and verify scoring works.

## Step 4: Seed test users (optional)

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_REF.supabase.co \
npm run seed:users
```

## Custom domain

In Vercel project settings → Domains, add your custom domain and follow the DNS instructions.

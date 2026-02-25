/**
 * Creates dummy test accounts in Supabase Auth.
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 * (Supabase Dashboard → Project Settings → API → service_role key).
 *
 * Run: npm run seed:users
 */

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  console.error(
    "Add SUPABASE_SERVICE_ROLE_KEY from Dashboard → Project Settings → API (service_role). Use only in scripts, never expose."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_ACCOUNTS = [
  { email: "alex@test.dojo", password: "Test123!", display_name: "Alex" },
  { email: "sam@test.dojo", password: "Test123!", display_name: "Sam" },
  { email: "jordan@test.dojo", password: "Test123!", display_name: "Jordan" },
  { email: "riley@test.dojo", password: "Test123!", display_name: "Riley" },
];

async function main() {
  console.log("Creating test accounts...\n");

  for (const { email, password, display_name } of TEST_ACCOUNTS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name },
    });

    if (error) {
      if (error.message?.includes("already been registered")) {
        console.log(`Skip (exists): ${email}`);
      } else {
        console.error(`Error for ${email}:`, error.message);
      }
      continue;
    }

    console.log(`Created: ${email} (${display_name})`);
  }

  console.log("\nDone. All test accounts use password: Test123!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

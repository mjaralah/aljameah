// Edge function: seeds the initial admin account (idempotent)
// Public: anyone can call ONCE to bootstrap; subsequent calls do nothing
// because the admin role already exists.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const ADMIN_EMAIL = "admin@test.com";
const ADMIN_PASSWORD = "Admin@12345";
const ADMIN_NAME = "مدير الموقع";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    // Check if any admin already exists
    const { data: existingRoles } = await admin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin")
      .limit(1);

    if (existingRoles && existingRoles.length > 0) {
      return new Response(
        JSON.stringify({
          ok: true,
          alreadySeeded: true,
          email: ADMIN_EMAIL,
          message: "Admin already exists",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Create the user
    const { data: created, error: createErr } =
      await admin.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: ADMIN_NAME },
      });

    if (createErr) throw createErr;
    const userId = created.user!.id;

    // Assign admin role
    const { error: roleErr } = await admin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });

    if (roleErr) throw roleErr;

    return new Response(
      JSON.stringify({
        ok: true,
        seeded: true,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("seed-admin error", err);
    return new Response(
      JSON.stringify({ ok: false, error: (err as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

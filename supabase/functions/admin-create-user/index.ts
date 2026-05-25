// Edge function: admin creates a new user (email + password + role)
// Caller must be an authenticated admin (verified in code).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

type Role = "admin" | "editor";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    // 1) Verify caller is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json(401, { ok: false, error: "Unauthorized" });
    }

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user?.id) {
      return json(401, { ok: false, error: "Invalid session" });
    }
    const callerId = userData.user.id;

    // 2) Verify caller has admin role
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    const { data: roleRow, error: roleCheckErr } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .eq("role", "admin")
      .maybeSingle();
    if (roleCheckErr) throw roleCheckErr;
    if (!roleRow) {
      return json(403, { ok: false, error: "صلاحية المدير مطلوبة" });
    }

    // 3) Parse + validate input
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    const fullName = String(body?.full_name ?? "").trim();
    const role = body?.role as Role;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json(400, { ok: false, error: "بريد إلكتروني غير صالح" });
    }
    if (!password || password.length < 8) {
      return json(400, {
        ok: false,
        error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
      });
    }
    if (!fullName) {
      return json(400, { ok: false, error: "الاسم الكامل مطلوب" });
    }
    if (role !== "admin" && role !== "editor") {
      return json(400, { ok: false, error: "الدور غير صالح" });
    }

    // 4) Create the user
    const { data: created, error: createErr } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });
    if (createErr) {
      const msg = createErr.message?.toLowerCase() ?? "";
      if (msg.includes("already") || msg.includes("registered")) {
        return json(409, { ok: false, error: "هذا البريد مسجّل مسبقاً" });
      }
      return json(400, { ok: false, error: createErr.message });
    }
    const userId = created.user!.id;

    // 5) Ensure profile name reflects provided full_name
    await admin
      .from("profiles")
      .update({ full_name: fullName, email })
      .eq("id", userId);

    // 6) Assign role
    const { error: roleErr } = await admin
      .from("user_roles")
      .insert({ user_id: userId, role });
    if (roleErr) {
      return json(400, { ok: false, error: roleErr.message });
    }

    return json(200, { ok: true, user_id: userId, email, role });
  } catch (err) {
    console.error("admin-create-user error", (err as Error).message);
    return json(500, { ok: false, error: (err as Error).message });
  }
});

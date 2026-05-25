// Admin actions on a user: disable / enable / delete / reset_password / update_profile
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

type Action =
  | "disable"
  | "enable"
  | "delete"
  | "reset_password"
  | "update_profile";

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

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return json(403, { ok: false, error: "صلاحية المدير مطلوبة" });
    }

    const body = await req.json().catch(() => ({}));
    const action = body?.action as Action;
    const targetUserId = String(body?.user_id ?? "");
    if (!targetUserId) return json(400, { ok: false, error: "user_id مطلوب" });

    const selfTarget = targetUserId === callerId;
    if (selfTarget && (action === "disable" || action === "delete")) {
      return json(400, {
        ok: false,
        error: "لا يمكن تعطيل أو حذف حسابك أنت.",
      });
    }

    switch (action) {
      case "disable": {
        // Ban for 100 years
        const { error } = await admin.auth.admin.updateUserById(targetUserId, {
          ban_duration: "876000h",
        });
        if (error) return json(400, { ok: false, error: error.message });
        return json(200, { ok: true });
      }
      case "enable": {
        const { error } = await admin.auth.admin.updateUserById(targetUserId, {
          ban_duration: "none",
        });
        if (error) return json(400, { ok: false, error: error.message });
        return json(200, { ok: true });
      }
      case "delete": {
        // Remove roles first, then auth user (profile cascades only if FK is set; we delete manually)
        await admin.from("user_roles").delete().eq("user_id", targetUserId);
        await admin.from("profiles").delete().eq("id", targetUserId);
        const { error } = await admin.auth.admin.deleteUser(targetUserId);
        if (error) return json(400, { ok: false, error: error.message });
        return json(200, { ok: true });
      }
      case "reset_password": {
        const newPassword = String(body?.new_password ?? "");
        if (!newPassword || newPassword.length < 8) {
          return json(400, {
            ok: false,
            error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
          });
        }
        const { error } = await admin.auth.admin.updateUserById(targetUserId, {
          password: newPassword,
        });
        if (error) return json(400, { ok: false, error: error.message });
        return json(200, { ok: true });
      }
      case "update_profile": {
        const fullName = String(body?.full_name ?? "").trim();
        const role = body?.role as "admin" | "editor" | undefined;
        if (!fullName) {
          return json(400, { ok: false, error: "الاسم مطلوب" });
        }
        await admin
          .from("profiles")
          .upsert({ id: targetUserId, full_name: fullName }, { onConflict: "id" });
        await admin.auth.admin.updateUserById(targetUserId, {
          user_metadata: { full_name: fullName },
        });
        if (role === "admin" || role === "editor") {
          // Replace role set with the single new role
          await admin.from("user_roles").delete().eq("user_id", targetUserId);
          const { error } = await admin
            .from("user_roles")
            .insert({ user_id: targetUserId, role });
          if (error) return json(400, { ok: false, error: error.message });
        }
        return json(200, { ok: true });
      }
      default:
        return json(400, { ok: false, error: "إجراء غير معروف" });
    }
  } catch (err) {
    console.error("admin-update-user error", (err as Error).message);
    return json(500, { ok: false, error: (err as Error).message });
  }
});

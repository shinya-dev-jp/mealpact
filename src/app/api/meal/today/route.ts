import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { logError } from "@/lib/server-log";

/**
 * GET /api/meal/today
 * Returns today's meal logs for the authenticated user.
 */
export async function GET(req: NextRequest) {
  const address = authenticateRequest(req);
  if (!address) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date().toISOString().slice(0, 10);

    const { data: logs, error } = await supabaseAdmin
      .from("mp_meal_logs")
      .select("*")
      .eq("user_address", address)
      .gte("logged_at", `${today}T00:00:00`)
      .lte("logged_at", `${today}T23:59:59`)
      .order("logged_at", { ascending: true });

    if (error) {
      logError("api/meal/today", "fetch failed", { code: error.code });
      return NextResponse.json({ error: "Failed to fetch meals" }, { status: 500 });
    }

    return NextResponse.json({ logs: logs ?? [] });
  } catch (err) {
    logError("api/meal/today", "unexpected error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

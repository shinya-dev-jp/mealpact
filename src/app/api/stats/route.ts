import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { logError } from "@/lib/server-log";

/**
 * GET /api/stats
 * Returns user stats: streak, best_streak, challenge history, etc.
 */
export async function GET(req: NextRequest) {
  const address = authenticateRequest(req);
  if (!address) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date().toISOString().slice(0, 10);

    // Get user profile
    const { data: user, error: userErr } = await supabaseAdmin
      .from("mp_users")
      .select("streak, best_streak, total_challenges, total_wins, target_calories, verification_level")
      .eq("address", address)
      .single();

    if (userErr || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate Mon of current week
    const now = new Date();
    const dow = now.getDay();
    const daysFromMon = dow === 0 ? 6 : dow - 1;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysFromMon);
    const weekStartStr = weekStart.toISOString().slice(0, 10);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const weekEndStr = weekEnd.toISOString().slice(0, 10);

    // Days logged this week
    const { data: weekLogs } = await supabaseAdmin
      .from("mp_meal_logs")
      .select("logged_at")
      .eq("user_address", address)
      .gte("logged_at", `${weekStartStr}T00:00:00`)
      .lte("logged_at", `${weekEndStr}T23:59:59`);

    const daysLoggedThisWeek = new Set(
      (weekLogs ?? []).map((l: { logged_at: string }) => l.logged_at.slice(0, 10))
    ).size;

    const todayLogged = (weekLogs ?? []).some(
      (l: { logged_at: string }) => l.logged_at.slice(0, 10) === today
    );

    // Challenge history (last 8)
    const { data: entries } = await supabaseAdmin
      .from("mp_challenge_entries")
      .select("*, mp_challenges(week_start, week_end, status)")
      .eq("user_address", address)
      .order("created_at", { ascending: false })
      .limit(8);

    return NextResponse.json({
      ...user,
      days_logged_this_week: daysLoggedThisWeek,
      today_logged: todayLogged,
      challenge_history: entries ?? [],
    });
  } catch (err) {
    logError("api/stats", "unexpected error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/stats
 * Body: { target_calories: number }
 * Updates user's daily calorie target.
 */
export async function PATCH(req: NextRequest) {
  const address = authenticateRequest(req);
  if (!address) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { target_calories?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { target_calories } = body;
  if (!target_calories || target_calories < 500 || target_calories > 5000) {
    return NextResponse.json(
      { error: "target_calories must be between 500 and 5000" },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("mp_users")
    .update({ target_calories: Math.round(target_calories) })
    .eq("address", address);

  if (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }

  return NextResponse.json({ success: true, target_calories: Math.round(target_calories) });
}

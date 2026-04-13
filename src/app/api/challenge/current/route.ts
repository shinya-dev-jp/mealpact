import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { logError } from "@/lib/server-log";

/**
 * GET /api/challenge/current
 * Returns the current week's challenge and the user's entry (if any).
 * Auto-creates the current week's challenge if it doesn't exist.
 */
export async function GET(req: NextRequest) {
  const address = authenticateRequest(req);
  if (!address) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    // Calculate Mon-Sun of current week
    const dow = today.getDay(); // 0=Sun, 1=Mon...
    const daysFromMon = dow === 0 ? 6 : dow - 1;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - daysFromMon);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekStartStr = weekStart.toISOString().slice(0, 10);
    const weekEndStr = weekEnd.toISOString().slice(0, 10);

    // Find or create the current week's challenge
    let { data: challenge } = await supabaseAdmin
      .from("mp_challenges")
      .select("*")
      .eq("week_start", weekStartStr)
      .maybeSingle();

    if (!challenge) {
      const { data: created, error: createErr } = await supabaseAdmin
        .from("mp_challenges")
        .insert({ week_start: weekStartStr, week_end: weekEndStr, status: "active" })
        .select()
        .single();

      if (createErr) {
        logError("api/challenge/current", "create challenge failed", { code: createErr.code });
        return NextResponse.json({ error: "Failed to create challenge" }, { status: 500 });
      }
      challenge = created;
    }

    // Fetch user's entry for this challenge
    const { data: myEntry } = await supabaseAdmin
      .from("mp_challenge_entries")
      .select("*")
      .eq("challenge_id", challenge.id)
      .eq("user_address", address)
      .maybeSingle();

    // Compute days logged this week for this user
    const { data: weekLogs } = await supabaseAdmin
      .from("mp_meal_logs")
      .select("logged_at")
      .eq("user_address", address)
      .gte("logged_at", `${weekStartStr}T00:00:00`)
      .lte("logged_at", `${weekEndStr}T23:59:59`);

    const daysLoggedThisWeek = new Set(
      (weekLogs ?? []).map((l: { logged_at: string }) => l.logged_at.slice(0, 10))
    ).size;

    // Days remaining in week
    const endDate = new Date(weekEndStr);
    const msLeft = endDate.getTime() - today.getTime();
    const daysLeft = Math.max(0, Math.ceil(msLeft / 86400000));

    // Today logged?
    const todayLogged = (weekLogs ?? []).some(
      (l: { logged_at: string }) => l.logged_at.slice(0, 10) === todayStr
    );

    return NextResponse.json({
      challenge,
      myEntry: myEntry ?? null,
      daysLoggedThisWeek,
      daysLeft,
      todayLogged,
    });
  } catch (err) {
    logError("api/challenge/current", "unexpected error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

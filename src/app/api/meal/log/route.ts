import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { logError } from "@/lib/server-log";
import type { FoodItem, MealType } from "@/lib/types";

/**
 * POST /api/meal/log
 * Body: { meal_type, foods_json, total_calories, total_protein, total_carbs, total_fat }
 * Returns: { success: true, log: MealLog }
 */
export async function POST(req: NextRequest) {
  const address = authenticateRequest(req);
  if (!address) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    meal_type?: MealType;
    foods_json?: FoodItem[];
    total_calories?: number;
    total_protein?: number;
    total_carbs?: number;
    total_fat?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { meal_type, foods_json, total_calories, total_protein, total_carbs, total_fat } = body;

  if (!meal_type || !foods_json || total_calories === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const VALID_MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
  if (!VALID_MEAL_TYPES.includes(meal_type)) {
    return NextResponse.json({ error: "Invalid meal_type" }, { status: 400 });
  }

  try {
    const { data: log, error } = await supabaseAdmin
      .from("mp_meal_logs")
      .insert({
        user_address: address,
        meal_type,
        foods_json,
        total_calories: Math.round(total_calories),
        total_protein: total_protein ?? 0,
        total_carbs: total_carbs ?? 0,
        total_fat: total_fat ?? 0,
      })
      .select()
      .single();

    if (error) {
      logError("api/meal/log", "insert failed", { code: error.code });
      return NextResponse.json({ error: "Failed to save meal" }, { status: 500 });
    }

    // Update challenge entry days_logged if user is participating this week
    await updateChallengeProgress(address);

    // Update user streak
    await updateUserStreak(address);

    return NextResponse.json({ success: true, log });
  } catch (err) {
    logError("api/meal/log", "unexpected error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function updateChallengeProgress(address: string) {
  try {
    const today = new Date().toISOString().slice(0, 10);

    // Find active challenge
    const { data: challenge } = await supabaseAdmin
      .from("mp_challenges")
      .select("id, week_start, week_end")
      .eq("status", "active")
      .lte("week_start", today)
      .gte("week_end", today)
      .maybeSingle();

    if (!challenge) return;

    // Check if user has an entry
    const { data: entry } = await supabaseAdmin
      .from("mp_challenge_entries")
      .select("id, days_logged")
      .eq("challenge_id", challenge.id)
      .eq("user_address", address)
      .maybeSingle();

    if (!entry) return;

    // Count distinct days logged this week
    const { data: logs } = await supabaseAdmin
      .from("mp_meal_logs")
      .select("logged_at")
      .eq("user_address", address)
      .gte("logged_at", `${challenge.week_start}T00:00:00`)
      .lte("logged_at", `${challenge.week_end}T23:59:59`);

    if (!logs) return;

    const distinctDays = new Set(logs.map((l) => l.logged_at.slice(0, 10))).size;

    await supabaseAdmin
      .from("mp_challenge_entries")
      .update({ days_logged: distinctDays })
      .eq("id", entry.id);
  } catch {
    // Non-fatal
  }
}

async function updateUserStreak(address: string) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    // Check if already logged today
    const { data: todayLogs } = await supabaseAdmin
      .from("mp_meal_logs")
      .select("id")
      .eq("user_address", address)
      .gte("logged_at", `${today}T00:00:00`)
      .limit(2);

    // Only update streak on the first log of the day
    if (!todayLogs || todayLogs.length !== 1) return;

    const { data: user } = await supabaseAdmin
      .from("mp_users")
      .select("streak, best_streak")
      .eq("address", address)
      .single();

    if (!user) return;

    // Check if logged yesterday (to continue streak)
    const { data: yesterdayLogs } = await supabaseAdmin
      .from("mp_meal_logs")
      .select("id")
      .eq("user_address", address)
      .gte("logged_at", `${yesterday}T00:00:00`)
      .lt("logged_at", `${today}T00:00:00`)
      .limit(1);

    const newStreak = yesterdayLogs && yesterdayLogs.length > 0 ? user.streak + 1 : 1;
    const newBest = Math.max(newStreak, user.best_streak);

    await supabaseAdmin
      .from("mp_users")
      .update({ streak: newStreak, best_streak: newBest })
      .eq("address", address);
  } catch {
    // Non-fatal
  }
}

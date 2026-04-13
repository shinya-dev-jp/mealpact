import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { logError, logInfo } from "@/lib/server-log";

/**
 * POST /api/challenge/join
 * Body: { challenge_id: string }
 * Records the user's commitment to this week's challenge.
 *
 * NOTE: Actual WLD transfer via MiniKit.pay() is handled client-side.
 * This endpoint records the participation after payment confirmation.
 */
export async function POST(req: NextRequest) {
  const address = authenticateRequest(req);
  if (!address) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { challenge_id?: string; payment_reference?: string; test_mode?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { challenge_id, payment_reference, test_mode } = body;
  if (!challenge_id) {
    return NextResponse.json({ error: "Missing challenge_id" }, { status: 400 });
  }

  // Test mode is only allowed when explicitly enabled via env var
  const isTestMode = test_mode === true && process.env.NEXT_PUBLIC_TEST_MODE === "true";
  const depositAmount = isTestMode ? 0 : 0.1;

  if (!isTestMode && !payment_reference) {
    return NextResponse.json({ error: "Payment reference required" }, { status: 400 });
  }

  try {
    // Verify challenge exists and is active
    const { data: challenge } = await supabaseAdmin
      .from("mp_challenges")
      .select("id, status")
      .eq("id", challenge_id)
      .eq("status", "active")
      .maybeSingle();

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found or not active" }, { status: 404 });
    }

    // Check for duplicate entry
    const { data: existing } = await supabaseAdmin
      .from("mp_challenge_entries")
      .select("id")
      .eq("challenge_id", challenge_id)
      .eq("user_address", address)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Already joined this challenge" }, { status: 409 });
    }

    // Create entry
    const { data: entry, error: insertErr } = await supabaseAdmin
      .from("mp_challenge_entries")
      .insert({
        challenge_id,
        user_address: address,
        wld_deposited: depositAmount,
        payment_reference: payment_reference ?? null,
        days_logged: 0,
      })
      .select()
      .single();

    if (insertErr) {
      logError("api/challenge/join", "insert failed", { code: insertErr.code });
      return NextResponse.json({ error: "Failed to join challenge" }, { status: 500 });
    }

    // Increment challenge participant_count and pool (direct update — no RPC needed)
    const { data: currentChallenge } = await supabaseAdmin
      .from("mp_challenges")
      .select("participant_count, total_pool")
      .eq("id", challenge_id)
      .single();

    if (currentChallenge) {
      const { error: updateErr } = await supabaseAdmin
        .from("mp_challenges")
        .update({
          participant_count: (currentChallenge.participant_count ?? 0) + 1,
          total_pool: (currentChallenge.total_pool ?? 0) + depositAmount,
        })
        .eq("id", challenge_id);

      if (updateErr) {
        logError("api/challenge/join", "pool update failed", { code: updateErr.code });
      }
    }

    // Update user's total_challenges count
    await supabaseAdmin
      .from("mp_users")
      .select("total_challenges")
      .eq("address", address)
      .single()
      .then(({ data }) => {
        if (data) {
          supabaseAdmin
            .from("mp_users")
            .update({ total_challenges: data.total_challenges + 1 })
            .eq("address", address);
        }
      });

    logInfo("api/challenge/join", "user joined challenge", {
      addressPrefix: address.slice(0, 6),
      challenge_id,
    });

    return NextResponse.json({ success: true, entry });
  } catch (err) {
    logError("api/challenge/join", "unexpected error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

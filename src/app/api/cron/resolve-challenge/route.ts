import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { logError, logInfo } from "@/lib/server-log";

/**
 * POST /api/cron/resolve-challenge
 * Runs every Monday at 00:00 UTC via Vercel Cron.
 * Resolves the previous week's challenge: marks winners/losers, distributes WLD.
 */
export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find challenges that ended yesterday (previous week, now resolvable)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    const { data: challenges } = await supabaseAdmin
      .from("mp_challenges")
      .select("*")
      .eq("status", "active")
      .lte("week_end", yesterday);

    if (!challenges || challenges.length === 0) {
      return NextResponse.json({ message: "No challenges to resolve" });
    }

    let resolved = 0;

    for (const challenge of challenges) {
      try {
        // Get all entries for this challenge
        const { data: entries } = await supabaseAdmin
          .from("mp_challenge_entries")
          .select("*")
          .eq("challenge_id", challenge.id);

        if (!entries || entries.length === 0) {
          await supabaseAdmin
            .from("mp_challenges")
            .update({ status: "resolved" })
            .eq("id", challenge.id);
          continue;
        }

        // Determine winners (5+ days logged)
        const winners = entries.filter((e) => e.days_logged >= 5);
        const losers = entries.filter((e) => e.days_logged < 5);

        const totalLoserPool = losers.reduce((sum, e) => sum + (e.wld_deposited ?? 0.1), 0);
        const bonusPerWinner = winners.length > 0 ? totalLoserPool / winners.length : 0;

        // Mark winners
        for (const winner of winners) {
          await supabaseAdmin
            .from("mp_challenge_entries")
            .update({
              is_success: true,
              wld_returned: (winner.wld_deposited ?? 0.1) + bonusPerWinner,
            })
            .eq("id", winner.id);

          // Increment user wins
          await supabaseAdmin
            .from("mp_users")
            .select("total_wins")
            .eq("address", winner.user_address)
            .single()
            .then(({ data }) => {
              if (data) {
                supabaseAdmin
                  .from("mp_users")
                  .update({ total_wins: data.total_wins + 1 })
                  .eq("address", winner.user_address);
              }
            });
        }

        // Mark losers
        for (const loser of losers) {
          await supabaseAdmin
            .from("mp_challenge_entries")
            .update({ is_success: false, wld_returned: 0 })
            .eq("id", loser.id);
        }

        // Update challenge summary
        await supabaseAdmin
          .from("mp_challenges")
          .update({
            status: "resolved",
            success_count: winners.length,
          })
          .eq("id", challenge.id);

        resolved++;
        logInfo("api/cron/resolve-challenge", "resolved challenge", {
          challengeId: challenge.id,
          winners: winners.length,
          losers: losers.length,
          bonusPerWinner,
        });
      } catch (err) {
        logError("api/cron/resolve-challenge", "failed to resolve one challenge", {
          challengeId: challenge.id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return NextResponse.json({ success: true, resolved });
  } catch (err) {
    logError("api/cron/resolve-challenge", "unexpected error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

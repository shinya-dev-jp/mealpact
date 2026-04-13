"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Loader2, CheckCircle2, XCircle, Info, ShieldCheck, AlertTriangle } from "lucide-react";
import { useI18n } from "@/i18n";
import { useApp } from "@/components/providers/AppProvider";
import { MiniKit, tokenToDecimals, Tokens } from "@worldcoin/minikit-js";

const DAYS_OF_WEEK = ["月", "火", "水", "木", "金", "土", "日"];

// ---------------------------------------------------------------------------
// ChallengeScreen
// ---------------------------------------------------------------------------

export function ChallengeScreen() {
  const { t } = useI18n();
  const {
    currentChallenge,
    myEntry,
    daysLoggedThisWeek,
    daysLeft,
    authToken,
    userProfile,
    refreshChallenge,
  } = useApp();

  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const successRate =
    currentChallenge && currentChallenge.participant_count > 0
      ? Math.round((currentChallenge.success_count / currentChallenge.participant_count) * 100)
      : 0;

  const isTestMode =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("test") === "1";

  const handleJoin = async () => {
    if (!authToken || !currentChallenge) return;
    setJoining(true);
    setJoinError(null);

    try {
      let paymentReference: string | undefined;

      if (isTestMode) {
        // Test mode: skip actual WLD deposit
        paymentReference = `test_${Date.now()}`;
      } else {
        // Production: trigger MiniKit.pay() for 0.1 WLD
        const receiverAddress = process.env.NEXT_PUBLIC_CHALLENGE_RECEIVER;
        if (!receiverAddress) {
          throw new Error("Challenge receiver address not configured");
        }

        const reference = `challenge_${currentChallenge.id}_${Date.now()}`;
        const { finalPayload } = await MiniKit.commandsAsync.pay({
          reference,
          to: receiverAddress,
          tokens: [
            {
              symbol: Tokens.WLD,
              token_amount: tokenToDecimals(0.1, Tokens.WLD).toString(),
            },
          ],
          description: "Weekly Challenge Entry (0.1 WLD)",
        });

        if (!finalPayload || finalPayload.status !== "success") {
          const code =
            finalPayload && "error_code" in finalPayload
              ? finalPayload.error_code
              : "cancelled";
          throw new Error(`Payment failed: ${code}`);
        }

        paymentReference = finalPayload.reference;
      }

      const res = await fetch("/api/challenge/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          challenge_id: currentChallenge.id,
          payment_reference: paymentReference,
          test_mode: isTestMode,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "join failed");
      }

      await refreshChallenge();
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : t("challenge.joinError"));
    } finally {
      setJoining(false);
    }
  };

  if (!currentChallenge) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white/30 px-6">
        <Trophy className="h-12 w-12" />
        <p className="text-sm">{t("challenge.noChallenge")}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900 text-lg">{t("challenge.title")}</h2>
        <span className="text-xs text-white/40">
          {t("challenge.daysLeft").replace("{n}", String(daysLeft))}
        </span>
      </div>

      {/* Orb bonus banner — shown only to device-verified users */}
      {userProfile?.verification_level !== "orb" && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5"
        >
          <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-300">Orbボーナス（近日公開）</p>
            <p className="text-[11px] text-white/50 mt-0.5">Orb認証済みユーザーは報酬が1.5倍になる予定です</p>
          </div>
        </motion.div>
      )}

      {/* Loss-aversion banner — shown when in challenge and at risk */}
      {myEntry && myEntry.is_success === null && daysLeft <= 3 && daysLoggedThisWeek < 5 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-3.5"
        >
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-red-300">
              あと {5 - daysLoggedThisWeek} 日記録しないとデポジットを失います
            </p>
            <p className="text-[11px] text-white/50 mt-0.5">残り {daysLeft} 日 — 今日も記録しよう！</p>
          </div>
        </motion.div>
      )}

      {/* Weekly progress dots */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm">
        <p className="text-xs text-white/50 mb-3 uppercase tracking-wider">{t("challenge.thisWeek")}</p>
        <div className="flex justify-between">
          {DAYS_OF_WEEK.map((day, i) => {
            const logged = i < daysLoggedThisWeek;
            return (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-white/30">{day}</span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    logged
                      ? "bg-emerald-500 shadow-lg shadow-emerald-500/30"
                      : "bg-white/10"
                  }`}
                >
                  {logged && <CheckCircle2 className="h-4 w-4 text-white" />}
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-center text-sm text-white/60 mt-4">
          {t("challenge.progress").replace("{n}", String(daysLoggedThisWeek))}
          <span className="text-xs text-white/30 ml-2">({t("challenge.successCondition")})</span>
        </p>
      </div>

      {/* Pool stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t("challenge.pool"), value: `${currentChallenge.total_pool.toFixed(1)} WLD` },
          { label: t("challenge.participants"), value: String(currentChallenge.participant_count) },
          { label: t("challenge.successRate"), value: `${successRate}%` },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white rounded-2xl p-3 border border-gray-200 shadow-sm text-center"
          >
            <p className="text-lg font-bold text-emerald-600">{value}</p>
            <p className="text-[10px] text-white/40 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Join / Status card */}
      {myEntry ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-900/40 rounded-3xl p-5 border border-emerald-500/30 text-center"
        >
          {myEntry.is_success === true ? (
            <>
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
              <p className="font-bold text-white">{t("challenge.succeeded")}</p>
              <p className="text-sm text-emerald-300 mt-1">
                {t("challenge.wldEarned").replace("{n}", String(myEntry.wld_returned?.toFixed(3) ?? "0.1"))}
              </p>
            </>
          ) : myEntry.is_success === false ? (
            <>
              <XCircle className="h-10 w-10 text-red-400 mx-auto mb-2" />
              <p className="font-bold text-white">{t("challenge.failed")}</p>
            </>
          ) : (
            <>
              <Trophy className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
              <p className="font-bold text-white">{t("challenge.joined")}</p>
              <p className="text-xs text-white/40 mt-1">
                {t("challenge.progress").replace("{n}", String(myEntry.days_logged))}
              </p>
            </>
          )}
        </motion.div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-white/40 text-center">{t("challenge.notJoined")}</p>
          {joinError && <p className="text-sm text-red-400 text-center">{joinError}</p>}
          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold transition-all flex items-center justify-center gap-2"
          >
            {joining ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Joining...</>
            ) : (
              <><Trophy className="h-4 w-4" />{t("challenge.joinButton")}</>
            )}
          </button>
        </div>
      )}

      {/* How it works */}
      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 pb-2 flex items-center gap-2 text-sm font-medium text-white/70">
          <Info className="h-4 w-4" />
          {t("challenge.howItWorks")}
        </div>
        <div className="px-4 pb-4 space-y-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex items-start gap-2 text-sm text-white/50">
              <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-300 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {n}
              </span>
              {t(`challenge.rule${n}`)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

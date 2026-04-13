"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Smartphone, Pencil, Check, X, ExternalLink, Share2, User } from "lucide-react";
import { useI18n } from "@/i18n";
import { useApp } from "@/components/providers/AppProvider";

// ---------------------------------------------------------------------------
// StatCard
// ---------------------------------------------------------------------------
function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl p-3 border border-gray-200 shadow-sm text-center">
      <p className="text-2xl font-black text-orange-500">{value}</p>
      {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProfileScreen
// ---------------------------------------------------------------------------

export function ProfileScreen() {
  const { t, locale, setLocale } = useI18n();
  const { userProfile, walletAddress, authToken, refreshStats } = useApp();

  const [editingTarget, setEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(String(userProfile?.target_calories ?? 1800));
  const [savingTarget, setSavingTarget] = useState(false);

  const handleSaveTarget = async () => {
    const val = parseInt(targetInput, 10);
    if (!val || val < 500 || val > 5000 || !authToken) return;
    setSavingTarget(true);
    try {
      await fetch("/api/stats", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ target_calories: val }),
      });
      await refreshStats();
      setEditingTarget(false);
    } finally {
      setSavingTarget(false);
    }
  };

  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "—";

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      {/* Identity */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center border border-emerald-200">
          <User className="h-7 w-7 text-emerald-600" />
        </div>
        <div>
          <p className="text-xs text-gray-400 font-mono">{shortAddress}</p>
          <div className="flex items-center gap-1.5 mt-1">
            {userProfile?.verification_level === "orb" ? (
              <>
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">{t("profile.verifiedOrb")}</span>
              </>
            ) : (
              <>
                <Smartphone className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-500">{t("profile.verifiedDevice")}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-3"
      >
        <StatCard label={t("profile.streak")} value={userProfile?.streak ?? 0} sub={t("profile.days")} />
        <StatCard label={t("profile.bestStreak")} value={userProfile?.best_streak ?? 0} sub={t("profile.days")} />
        <StatCard label={t("profile.totalChallenges")} value={userProfile?.total_challenges ?? 0} />
        <StatCard label={t("profile.wins")} value={userProfile?.total_wins ?? 0} />
      </motion.div>

      {/* Share / Invite */}
      <button
        onClick={() => {
          const text = `MealPactで食事を記録して健康習慣にコミット中！\nhttps://mealpact.vercel.app`;
          if (navigator.share) {
            navigator.share({ text }).catch(() => {});
          } else {
            navigator.clipboard.writeText(text);
          }
        }}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 transition-all active:scale-95"
      >
        <Share2 className="h-4 w-4" />
        {t("profile.invite")}
      </button>

      {/* Daily calorie target */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{t("profile.targetCalories")}</p>
            {editingTarget ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  className="w-24 bg-gray-100 rounded-lg px-2 py-1 text-sm text-gray-900 border border-gray-200"
                  autoFocus
                />
                <span className="text-sm text-gray-500">{t("profile.kcal")}</span>
                <button onClick={handleSaveTarget} disabled={savingTarget} className="text-emerald-500">
                  <Check className="h-4 w-4" />
                </button>
                <button onClick={() => setEditingTarget(false)} className="text-gray-400">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <p className="text-2xl font-black text-gray-900 mt-1">
                {userProfile?.target_calories ?? 1800}
                <span className="text-sm font-normal text-gray-400 ml-1">{t("profile.kcal")}</span>
              </p>
            )}
          </div>
          {!editingTarget && (
            <button
              onClick={() => {
                setTargetInput(String(userProfile?.target_calories ?? 1800));
                setEditingTarget(true);
              }}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
              {t("profile.editTarget")}
            </button>
          )}
        </div>
      </div>

      {/* Language toggle */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">{t("profile.language")}</p>
        <div className="flex gap-2">
          {(["ja", "en"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLocale(lang)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                locale === lang
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-gray-100 border border-gray-200 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {lang === "ja" ? t("profile.langJa") : t("profile.langEn")}
            </button>
          ))}
        </div>
      </div>

      {/* Cross-promo: Daily Predict */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">{t("profile.crossPromo")}</p>
        <a
          href="https://daily-predict-two.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/daily-predict-icon.png" alt="Daily Predict" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{t("profile.dailyPredict")}</p>
              <p className="text-xs text-gray-500">{t("profile.dailyPredictDesc")}</p>
            </div>
          </div>
          <ExternalLink className="h-4 w-4 text-gray-400" />
        </a>
      </div>
    </div>
  );
}

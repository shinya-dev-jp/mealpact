"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import { LogScreen } from "@/components/screens/LogScreen";
import { ChallengeScreen } from "@/components/screens/ChallengeScreen";
import { ProfileScreen } from "@/components/screens/ProfileScreen";
import { Navigation } from "@/components/Navigation";
import { AppProvider, useApp } from "@/components/providers/AppProvider";
import { Loader2, Wallet, CheckCircle, Flame, ShieldCheck } from "lucide-react";
import { I18nProvider, useI18n } from "@/i18n";
import { MiniKit } from "@worldcoin/minikit-js";
import type { MpUser } from "@/lib/types";

// ---------------------------------------------------------------------------
// Language toggle (compact, used in header)
// ---------------------------------------------------------------------------
function LangToggle() {
  const { locale, setLocale } = useI18n();
  return (
    <div className="flex items-center rounded-full border border-gray-200 overflow-hidden bg-gray-100">
      {(["ja", "en"] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => setLocale(lang)}
          className={`px-2 py-0.5 text-[10px] font-semibold transition-colors ${
            locale === lang
              ? "bg-orange-500 text-white"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          {lang === "ja" ? "JP" : "EN"}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------
function AppSkeleton() {
  return (
    <div className="mx-auto max-w-md min-h-dvh flex flex-col items-center justify-center bg-[#f5f0ff] gap-4 p-8">
      <div className="w-16 h-16 rounded-2xl bg-purple-200 animate-pulse" />
      <div className="w-48 h-4 rounded bg-purple-200 animate-pulse" />
      <div className="w-32 h-3 rounded bg-purple-200 animate-pulse mt-2" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Wallet Auth Screen (SIWE)
// ---------------------------------------------------------------------------
function WalletAuthScreen({
  onAuthSuccess,
}: {
  onAuthSuccess: (address: string, user: MpUser, authToken: string) => void;
}) {
  const { t } = useI18n();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = useCallback(async () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    setError(null);

    try {
      const nonceRes = await fetch("/api/auth/nonce");
      if (!nonceRes.ok) { setError("Failed to initialize authentication"); setIsAuthenticating(false); return; }
      const { nonce } = await nonceRes.json();
      if (!nonce) { setError("Authentication setup failed"); setIsAuthenticating(false); return; }

      if (!MiniKit.isInstalled()) {
        setError(t("auth.notInWorldApp"));
        setIsAuthenticating(false);
        return;
      }

      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce,
        statement: "Sign in to MealPact",
        expirationTime: new Date(Date.now() + 1000 * 60 * 10),
      });

      if (!finalPayload || finalPayload.status !== "success") {
        const reason = finalPayload && "error_code" in finalPayload ? finalPayload.error_code : "cancelled";
        setError(`Sign-in cancelled or failed (${reason})`);
        setIsAuthenticating(false);
        return;
      }

      const completeRes = await fetch("/api/auth/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: finalPayload, nonce }),
      });

      const json = await completeRes.json();
      if (!completeRes.ok || !json.success) {
        setError(json.error ?? "Authentication failed");
        setIsAuthenticating(false);
        return;
      }

      onAuthSuccess(json.user.address, json.user as MpUser, json.auth_token);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Error: ${msg.slice(0, 120)}`);
    } finally {
      setIsAuthenticating(false);
    }
  }, [isAuthenticating, onAuthSuccess, t]);

  const FEATURES = [
    { key: "auth.feature1", emoji: "📸", bg: "bg-orange-50", border: "border-orange-100", text: "text-orange-600" },
    { key: "auth.feature2", emoji: "🏆", bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-600" },
    { key: "auth.feature3", emoji: "💰", bg: "bg-purple-50", border: "border-purple-100", text: "text-purple-600" },
  ] as const;

  return (
    <div className="mx-auto max-w-md min-h-dvh flex flex-col bg-gradient-to-b from-[#f5f0ff] via-[#ede8ff] to-[#e8e0ff] relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] right-[-20%] w-72 h-72 bg-orange-300/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[-15%] w-64 h-64 bg-purple-400/15 rounded-full blur-[80px] pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6 relative z-10">
        {/* Hero */}
        <div className="flex flex-col items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-512.png" alt="MealPact" width={96} height={96} className="drop-shadow-xl" />
          <div className="text-center">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t("auth.title")}</h1>
            <p className="text-gray-500 text-sm mt-1 leading-relaxed max-w-[260px] whitespace-pre-line">
              {t("auth.subtitle")}
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="w-full space-y-2.5">
          {FEATURES.map(({ key, emoji, bg, border }) => (
            <div key={key} className={`flex items-center gap-3 ${bg} border ${border} rounded-2xl px-4 py-3.5 shadow-sm`}>
              <span className="text-xl">{emoji}</span>
              <span className="text-gray-700 text-[13px] font-medium">{t(key)}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="w-full space-y-3">
          <button
            onClick={handleSignIn}
            disabled={isAuthenticating}
            className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-orange-300/40"
          >
            {isAuthenticating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
            {isAuthenticating ? t("auth.verifying") : t("auth.button")}
          </button>

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-[11px] text-emerald-600 font-semibold">Verified Humans Only</span>
          </div>

          <p className="text-gray-400 text-[11px] text-center">{t("auth.footer")}</p>
        </div>

        {/* Legal */}
        <div className="flex gap-4 text-[10px] text-gray-400">
          <a href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
          <a href="/terms" className="hover:text-gray-600 transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MealPact app shell
// ---------------------------------------------------------------------------
function MealPactApp() {
  const { walletAddress, userProfile, onAuthenticated, currentTab: tab, setCurrentTab: setTab } = useApp();
  const { t } = useI18n();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    setIsOffline(!navigator.onLine);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  const isPreview = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("preview") === "1";
  if (!walletAddress && !isPreview) {
    return <WalletAuthScreen onAuthSuccess={onAuthenticated} />;
  }

  return (
    <div className="mx-auto max-w-md min-h-dvh flex flex-col bg-[#f5f0ff]">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-white/90 backdrop-blur-lg sticky top-0 z-50">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-512.png" alt="" width={24} height={24} className="drop-shadow-sm" />
          <span className="font-bold text-gray-900 text-sm tracking-tight">MealPact</span>
        </div>
        <div className="flex items-center gap-1.5">
          {userProfile && userProfile.streak > 0 && (
            <span className="text-[10px] font-bold text-orange-500 bg-orange-100 px-2 py-1 rounded-full inline-flex items-center gap-1">
              <Flame className="h-3 w-3" />
              {userProfile.streak}
            </span>
          )}
          <LangToggle />
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] text-emerald-600 font-semibold">ID</span>
          </div>
        </div>
      </header>

      {/* Tab content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {tab === "log" && <LogScreen />}
        {tab === "challenge" && <ChallengeScreen />}
        {tab === "profile" && <ProfileScreen />}
      </main>

      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-black text-xs font-semibold text-center py-1.5">
          {t("app.offline")}
        </div>
      )}

      <Navigation activeTab={tab} onTabChange={setTab} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------
export default function Home() {
  return (
    <Suspense fallback={<AppSkeleton />}>
      <I18nProvider>
        <AppProvider>
          <MealPactApp />
        </AppProvider>
      </I18nProvider>
    </Suspense>
  );
}

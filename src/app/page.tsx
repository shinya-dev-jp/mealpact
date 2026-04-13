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
    <div className="flex items-center rounded-full border border-white/10 overflow-hidden bg-white/5">
      {(["ja", "en"] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => setLocale(lang)}
          className={`px-2 py-0.5 text-[10px] font-semibold transition-colors ${
            locale === lang
              ? "bg-emerald-600/40 text-emerald-300"
              : "text-white/30 hover:text-white/60"
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
    <div className="mx-auto max-w-md min-h-dvh flex flex-col items-center justify-center bg-[#052e16] gap-4 p-8">
      <div className="w-16 h-16 rounded-2xl bg-emerald-900/60 animate-pulse" />
      <div className="w-48 h-4 rounded bg-emerald-900/60 animate-pulse" />
      <div className="w-32 h-3 rounded bg-emerald-900/60 animate-pulse mt-2" />
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

  return (
    <div className="mx-auto max-w-md min-h-dvh flex flex-col bg-[#052e16] relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-30%] w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[400px] h-[400px] bg-emerald-800/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6 relative z-10">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-3xl blur-xl scale-110" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon-512.png"
            alt="MealPact"
            width={88}
            height={88}
            className="relative rounded-2xl shadow-2xl"
          />
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">{t("auth.title")}</h1>
          <p className="text-white/50 text-sm leading-relaxed max-w-[280px] whitespace-pre-line">
            {t("auth.subtitle")}
          </p>
        </div>

        <div className="w-full space-y-2.5">
          {["auth.feature1", "auth.feature2", "auth.feature3"].map((key, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3.5">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <span className="text-white/80 text-[13px] font-medium">{t(key)}</span>
            </div>
          ))}
        </div>

        <div className="w-full relative">
          <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-lg opacity-20" />
          <button
            onClick={handleSignIn}
            disabled={isAuthenticating}
            className="relative w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg"
          >
            {isAuthenticating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
            {isAuthenticating ? t("auth.verifying") : t("auth.button")}
          </button>
        </div>

        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
        <p className="text-white/25 text-[11px] text-center">{t("auth.footer")}</p>

        {/* Verified Humans Only badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[11px] text-emerald-300 font-medium">Verified Humans Only</span>
        </div>

        {/* Legal footer */}
        <div className="flex gap-4 text-[10px] text-white/20">
          <a href="/privacy" className="hover:text-white/50 transition-colors">Privacy Policy</a>
          <a href="/terms" className="hover:text-white/50 transition-colors">Terms of Service</a>
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
    <div className="mx-auto max-w-md min-h-dvh flex flex-col bg-[#052e16]">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-[#052e16]/95 backdrop-blur-lg sticky top-0 z-50">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-512.png" alt="" width={24} height={24} className="rounded-md" />
          <span className="font-bold text-white text-sm tracking-tight">MealPact</span>
        </div>
        <div className="flex items-center gap-1.5">
          {userProfile && userProfile.streak > 0 && (
            <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full inline-flex items-center gap-1">
              <Flame className="h-3 w-3" />
              {userProfile.streak}
            </span>
          )}
          <LangToggle />
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[9px] text-emerald-400 font-semibold">ID</span>
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

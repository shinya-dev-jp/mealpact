"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { MpUser, MealLog, Challenge, ChallengeEntry, TabKey } from "@/lib/types";

// ============================================================
// Context shape
// ============================================================

interface AppState {
  walletAddress: string | null;
  authToken: string | null;
  userProfile: MpUser | null;
  todayLogs: MealLog[];
  currentChallenge: Challenge | null;
  myEntry: ChallengeEntry | null;
  daysLoggedThisWeek: number;
  daysLeft: number;
  todayLogged: boolean;
  isLoadingInitial: boolean;
  currentTab: TabKey;
  setCurrentTab: (tab: TabKey) => void;
  onAuthenticated: (address: string, profile: MpUser, authToken: string) => void;
  refreshTodayLogs: () => Promise<void>;
  refreshChallenge: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

const LS_ADDRESS_KEY = "mp_wallet_address";
const LS_TOKEN_KEY = "mp_wallet_token";

// ============================================================
// Provider
// ============================================================

export function AppProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    if (typeof window !== "undefined") return localStorage.getItem(LS_ADDRESS_KEY) ?? null;
    return null;
  });
  const [authToken, setAuthToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") return localStorage.getItem(LS_TOKEN_KEY) ?? null;
    return null;
  });
  const [userProfile, setUserProfile] = useState<MpUser | null>(null);
  const [todayLogs, setTodayLogs] = useState<MealLog[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [myEntry, setMyEntry] = useState<ChallengeEntry | null>(null);
  const [daysLoggedThisWeek, setDaysLoggedThisWeek] = useState(0);
  const [daysLeft, setDaysLeft] = useState(0);
  const [todayLogged, setTodayLogged] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [currentTab, setCurrentTabRaw] = useState<TabKey>("log");
  const setCurrentTab = useCallback((tab: TabKey) => setCurrentTabRaw(tab), []);

  // ── Fetch today's logs ─────────────────────────────────────────────────────
  const refreshTodayLogs = useCallback(async () => {
    if (!authToken) return;
    try {
      const res = await fetch("/api/meal/today", {
        headers: { authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) return;
      const json = await res.json();
      setTodayLogs(json.logs ?? []);
    } catch {
      // Non-fatal
    }
  }, [authToken]);

  // ── Fetch current challenge ───────────────────────────────────────────────
  const refreshChallenge = useCallback(async () => {
    if (!authToken) return;
    try {
      const res = await fetch("/api/challenge/current", {
        headers: { authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) return;
      const json = await res.json();
      setCurrentChallenge(json.challenge ?? null);
      setMyEntry(json.myEntry ?? null);
      setDaysLoggedThisWeek(json.daysLoggedThisWeek ?? 0);
      setDaysLeft(json.daysLeft ?? 0);
      setTodayLogged(json.todayLogged ?? false);
    } catch {
      // Non-fatal
    }
  }, [authToken]);

  // ── Fetch user stats ──────────────────────────────────────────────────────
  const refreshStats = useCallback(async () => {
    if (!authToken) return;
    try {
      const res = await fetch("/api/stats", {
        headers: { authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) return;
      const json = await res.json();
      setUserProfile((prev) =>
        prev
          ? {
              ...prev,
              streak: json.streak,
              best_streak: json.best_streak,
              total_challenges: json.total_challenges,
              total_wins: json.total_wins,
              target_calories: json.target_calories,
            }
          : prev
      );
    } catch {
      // Non-fatal
    }
  }, [authToken]);

  // ── On auth: load all initial data ───────────────────────────────────────
  useEffect(() => {
    if (!authToken) {
      setIsLoadingInitial(false);
      return;
    }

    let cancelled = false;

    async function loadInitialData() {
      setIsLoadingInitial(true);
      await Promise.all([
        // todayLogs
        fetch("/api/meal/today", { headers: { authorization: `Bearer ${authToken}` } })
          .then((r) => r.json())
          .then((j) => { if (!cancelled) setTodayLogs(j.logs ?? []); })
          .catch(() => {}),
        // challenge
        fetch("/api/challenge/current", { headers: { authorization: `Bearer ${authToken}` } })
          .then((r) => r.json())
          .then((j) => {
            if (!cancelled) {
              setCurrentChallenge(j.challenge ?? null);
              setMyEntry(j.myEntry ?? null);
              setDaysLoggedThisWeek(j.daysLoggedThisWeek ?? 0);
              setDaysLeft(j.daysLeft ?? 0);
              setTodayLogged(j.todayLogged ?? false);
            }
          })
          .catch(() => {}),
        // stats (to populate streak etc)
        fetch("/api/stats", { headers: { authorization: `Bearer ${authToken}` } })
          .then((r) => r.json())
          .then((j) => {
            if (!cancelled) {
              setUserProfile((prev) =>
                prev ? { ...prev, streak: j.streak, best_streak: j.best_streak,
                  total_challenges: j.total_challenges, total_wins: j.total_wins } : prev
              );
            }
          })
          .catch(() => {}),
      ]);
      if (!cancelled) setIsLoadingInitial(false);
    }

    loadInitialData();
    return () => { cancelled = true; };
  }, [authToken]);

  // ── Called by Wallet Auth on success ────────────────────────────────────
  const onAuthenticated = useCallback(
    (address: string, profile: MpUser, token: string) => {
      setWalletAddress(address);
      setUserProfile(profile);
      setAuthToken(token);
      if (typeof window !== "undefined") {
        localStorage.setItem(LS_ADDRESS_KEY, address);
        localStorage.setItem(LS_TOKEN_KEY, token);
      }
    },
    []
  );

  return (
    <AppContext.Provider
      value={{
        walletAddress,
        authToken,
        userProfile,
        todayLogs,
        currentChallenge,
        myEntry,
        daysLoggedThisWeek,
        daysLeft,
        todayLogged,
        isLoadingInitial,
        currentTab,
        setCurrentTab,
        onAuthenticated,
        refreshTodayLogs,
        refreshChallenge,
        refreshStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ============================================================
// Hook
// ============================================================

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within <AppProvider>");
  return ctx;
}

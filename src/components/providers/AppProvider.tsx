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
// Preview mode demo data
// ============================================================

const PREVIEW_ADDRESS = "0xDEMO0000000000000000000000000000000001";

const PREVIEW_USER: MpUser = {
  address: PREVIEW_ADDRESS,
  verification_level: "orb",
  target_calories: 2000,
  language: "en",
  streak: 7,
  best_streak: 14,
  total_challenges: 5,
  total_wins: 3,
  created_at: "2026-01-01T00:00:00Z",
};

const PREVIEW_LOGS: MealLog[] = [
  {
    id: "demo-1",
    user_address: PREVIEW_ADDRESS,
    meal_type: "breakfast",
    foods_json: [
      { name_ja: "オートミール", name_en: "Oatmeal", portion: "1 cup", calories: 300, protein: 10, carbs: 54, fat: 6 },
      { name_ja: "バナナ", name_en: "Banana", portion: "1 medium", calories: 105, protein: 1, carbs: 27, fat: 0 },
    ],
    total_calories: 405,
    total_protein: 11,
    total_carbs: 81,
    total_fat: 6,
    logged_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    user_address: PREVIEW_ADDRESS,
    meal_type: "lunch",
    foods_json: [
      { name_ja: "鶏胸肉", name_en: "Chicken breast", portion: "150g", calories: 248, protein: 46, carbs: 0, fat: 5 },
      { name_ja: "玄米", name_en: "Brown rice", portion: "1 cup", calories: 218, protein: 5, carbs: 46, fat: 2 },
      { name_ja: "サラダ", name_en: "Mixed salad", portion: "1 bowl", calories: 50, protein: 2, carbs: 8, fat: 1 },
    ],
    total_calories: 516,
    total_protein: 53,
    total_carbs: 54,
    total_fat: 8,
    logged_at: new Date().toISOString(),
  },
  {
    id: "demo-3",
    user_address: PREVIEW_ADDRESS,
    meal_type: "snack",
    foods_json: [
      { name_ja: "ギリシャヨーグルト", name_en: "Greek yogurt", portion: "200g", calories: 130, protein: 17, carbs: 9, fat: 3 },
    ],
    total_calories: 130,
    total_protein: 17,
    total_carbs: 9,
    total_fat: 3,
    logged_at: new Date().toISOString(),
  },
];

const PREVIEW_CHALLENGE: Challenge = {
  id: "demo-challenge-1",
  week_start: new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0],
  week_end: new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0],
  status: "active",
  total_pool: 2.5,
  participant_count: 48,
  success_count: 32,
};

const PREVIEW_ENTRY: ChallengeEntry = {
  id: "demo-entry-1",
  challenge_id: "demo-challenge-1",
  user_address: PREVIEW_ADDRESS,
  wld_deposited: 0.1,
  days_logged: 5,
  is_success: null,
  wld_returned: null,
  created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
};

function isPreviewMode(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("preview") === "1";
}

// ============================================================
// Provider
// ============================================================

export function AppProvider({ children }: { children: ReactNode }) {
  const preview = isPreviewMode();

  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    if (preview) return PREVIEW_ADDRESS;
    if (typeof window !== "undefined") return localStorage.getItem(LS_ADDRESS_KEY) ?? null;
    return null;
  });
  const [authToken, setAuthToken] = useState<string | null>(() => {
    if (preview) return "preview-token";
    if (typeof window !== "undefined") return localStorage.getItem(LS_TOKEN_KEY) ?? null;
    return null;
  });
  const [userProfile, setUserProfile] = useState<MpUser | null>(() => preview ? PREVIEW_USER : null);
  const [todayLogs, setTodayLogs] = useState<MealLog[]>(() => preview ? PREVIEW_LOGS : []);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(() => preview ? PREVIEW_CHALLENGE : null);
  const [myEntry, setMyEntry] = useState<ChallengeEntry | null>(() => preview ? PREVIEW_ENTRY : null);
  const [daysLoggedThisWeek, setDaysLoggedThisWeek] = useState(() => preview ? 5 : 0);
  const [daysLeft, setDaysLeft] = useState(() => preview ? 4 : 0);
  const [todayLogged, setTodayLogged] = useState(() => preview ? true : false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(() => preview ? false : true);
  const [currentTab, setCurrentTabRaw] = useState<TabKey>("log");
  const setCurrentTab = useCallback((tab: TabKey) => setCurrentTabRaw(tab), []);

  // ── Fetch today's logs ─────────────────────────────────────────────────────
  const refreshTodayLogs = useCallback(async () => {
    if (preview || !authToken) return;
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
  }, [authToken, preview]);

  // ── Fetch current challenge ───────────────────────────────────────────────
  const refreshChallenge = useCallback(async () => {
    if (preview || !authToken) return;
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
  }, [authToken, preview]);

  // ── Fetch user stats ──────────────────────────────────────────────────────
  const refreshStats = useCallback(async () => {
    if (preview || !authToken) return;
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
  }, [authToken, preview]);

  // ── On auth: load all initial data ───────────────────────────────────────
  useEffect(() => {
    if (preview || !authToken) {
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

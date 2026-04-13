// ============================================================
// MealPact types
// ============================================================

export type VerificationLevel = "orb" | "device" | "none";
export type TabKey = "log" | "challenge" | "profile";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

// ============================================================
// User
// ============================================================

export interface MpUser {
  address: string;
  verification_level: VerificationLevel;
  target_calories: number;
  language: string;
  streak: number;
  best_streak: number;
  total_challenges: number;
  total_wins: number;
  created_at: string;
}

// ============================================================
// Meal logging
// ============================================================

export interface FoodItem {
  name_ja: string;
  name_en: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealLog {
  id: string;
  user_address: string;
  meal_type: MealType;
  foods_json: FoodItem[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  logged_at: string;
}

export interface AnalyzeResponse {
  foods: FoodItem[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
}

// ============================================================
// Challenges
// ============================================================

export interface Challenge {
  id: string;
  week_start: string;
  week_end: string;
  status: "active" | "resolved";
  total_pool: number;
  participant_count: number;
  success_count: number;
}

export interface ChallengeEntry {
  id: string;
  challenge_id: string;
  user_address: string;
  wld_deposited: number;
  days_logged: number;
  is_success: boolean | null;
  wld_returned: number | null;
  created_at: string;
}

// ============================================================
// Stats
// ============================================================

export interface UserStats {
  streak: number;
  best_streak: number;
  total_challenges: number;
  total_wins: number;
  days_logged_this_week: number;
  today_logged: boolean;
}

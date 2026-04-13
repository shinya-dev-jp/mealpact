-- MealPact tables migration
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS mp_users (
  address TEXT PRIMARY KEY,
  verification_level TEXT NOT NULL DEFAULT 'device',
  target_calories INTEGER DEFAULT 1800,
  language TEXT DEFAULT 'ja',
  streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  total_challenges INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mp_meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address TEXT NOT NULL REFERENCES mp_users(address),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  foods_json JSONB NOT NULL,
  total_calories INTEGER NOT NULL,
  total_protein REAL DEFAULT 0,
  total_carbs REAL DEFAULT 0,
  total_fat REAL DEFAULT 0,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mp_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
  total_pool REAL DEFAULT 0,
  participant_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mp_challenge_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES mp_challenges(id),
  user_address TEXT NOT NULL REFERENCES mp_users(address),
  wld_deposited REAL NOT NULL DEFAULT 0.1,
  days_logged INTEGER DEFAULT 0,
  is_success BOOLEAN,
  wld_returned REAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, user_address)
);

CREATE INDEX IF NOT EXISTS idx_meal_logs_user_date ON mp_meal_logs(user_address, logged_at);
CREATE INDEX IF NOT EXISTS idx_challenge_entries_challenge ON mp_challenge_entries(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_entries_user ON mp_challenge_entries(user_address);

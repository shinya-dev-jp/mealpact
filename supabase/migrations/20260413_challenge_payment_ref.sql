-- Add payment_reference column to track MiniKit.pay() transaction references
ALTER TABLE mp_challenge_entries
  ADD COLUMN IF NOT EXISTS payment_reference TEXT;

-- Add index for payment reference lookups
CREATE INDEX IF NOT EXISTS idx_challenge_entries_payment_ref
  ON mp_challenge_entries(payment_reference)
  WHERE payment_reference IS NOT NULL;

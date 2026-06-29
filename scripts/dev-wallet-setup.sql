-- Run once in Supabase Dashboard → SQL Editor
-- Applies wallet credit RPC + adds ₹500 to your most recently active profile

-- 1. Wallet credit RPC (required for in-app recharge / add credits)
CREATE OR REPLACE FUNCTION prevent_wallet_client_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.wallet_balance IS DISTINCT FROM OLD.wallet_balance THEN
    IF current_setting('request.jwt.claim.role', true) = 'authenticated'
       AND COALESCE(current_setting('app.wallet_bypass', true), '') <> 'true' THEN
      NEW.wallet_balance := OLD.wallet_balance;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION credit_wallet(p_amount NUMERIC, p_reference TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  new_bal NUMERIC;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  PERFORM set_config('app.wallet_bypass', 'true', true);

  UPDATE profiles
  SET wallet_balance = wallet_balance + p_amount
  WHERE id = uid
  RETURNING wallet_balance INTO new_bal;

  INSERT INTO transactions (user_id, type, amount, description)
  VALUES (uid, 'recharge', p_amount, COALESCE(p_reference, 'Wallet recharge'));

  RETURN jsonb_build_object('success', true, 'wallet_balance', new_bal);
END;
$$;

GRANT EXECUTE ON FUNCTION credit_wallet(NUMERIC, TEXT) TO authenticated;

-- 3. Session billing debit RPC (required for chat/call/video charges)
CREATE OR REPLACE FUNCTION debit_wallet(
  p_amount NUMERIC,
  p_session_id UUID DEFAULT NULL,
  p_reference TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  current_bal NUMERIC;
  new_bal NUMERIC;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  SELECT wallet_balance INTO current_bal FROM profiles WHERE id = uid;
  IF current_bal IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;
  IF current_bal < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  PERFORM set_config('app.wallet_bypass', 'true', true);

  UPDATE profiles
  SET wallet_balance = wallet_balance - p_amount
  WHERE id = uid
  RETURNING wallet_balance INTO new_bal;

  INSERT INTO transactions (user_id, type, amount, description, session_id)
  VALUES (uid, 'debit', p_amount, COALESCE(p_reference, 'Session charge'), p_session_id);

  RETURN jsonb_build_object('success', true, 'wallet_balance', new_bal);
END;
$$;

GRANT EXECUTE ON FUNCTION debit_wallet(NUMERIC, UUID, TEXT) TO authenticated;

-- 2. Add ₹500 to the most recently updated profile (your account)
UPDATE profiles
SET wallet_balance = wallet_balance + 500
WHERE id = (
  SELECT id FROM profiles
  ORDER BY created_at DESC
  LIMIT 1
);

INSERT INTO transactions (user_id, type, amount, description)
SELECT id, 'recharge', 500, 'Dev credit'
FROM profiles
ORDER BY created_at DESC
LIMIT 1;

SELECT id, anonymous_name, phone, wallet_balance
FROM profiles
ORDER BY created_at DESC
LIMIT 1;

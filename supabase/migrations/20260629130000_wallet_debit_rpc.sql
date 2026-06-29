-- Session billing: deduct wallet balance with transaction record
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

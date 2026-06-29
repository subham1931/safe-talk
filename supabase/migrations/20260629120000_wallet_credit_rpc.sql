-- Allow server-side wallet credits via RPC (recharge flow)
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

-- safeTalk initial database schema
-- Tables: profiles, listener_profiles, sessions, messages, transactions, session_reviews, st_user_reports
-- Includes RLS policies and wallet balance protection trigger

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('seeker', 'listener')),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_age_verified BOOLEAN DEFAULT FALSE,
  anonymous_name TEXT,
  avatar_id TEXT,
  gender TEXT,
  date_of_birth DATE,
  wallet_balance NUMERIC DEFAULT 0 CHECK (wallet_balance >= 0),
  blocked_user_ids UUID[] DEFAULT '{}',
  onboarding_complete BOOLEAN DEFAULT FALSE,
  notification_preferences JSONB DEFAULT '{"session_requests": true, "low_balance": true, "listener_online": true}'::jsonb,
  language_preference TEXT DEFAULT 'en'
);

CREATE TABLE IF NOT EXISTS listener_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  bio TEXT,
  languages TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  rate_per_min_chat NUMERIC DEFAULT 5,
  rate_per_min_call NUMERIC DEFAULT 8,
  rate_per_min_video NUMERIC DEFAULT 12,
  is_online BOOLEAN DEFAULT FALSE,
  rating NUMERIC DEFAULT 4.5,
  rating_count INTEGER DEFAULT 0,
  today_minutes INTEGER DEFAULT 0,
  daily_target_minutes INTEGER DEFAULT 120,
  id_document_url TEXT,
  selfie_url TEXT,
  gender TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seeker_id UUID NOT NULL REFERENCES profiles(id),
  listener_id UUID NOT NULL REFERENCES profiles(id),
  type TEXT NOT NULL CHECK (type IN ('chat', 'call', 'video')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'ended', 'declined')),
  category_tag TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  rate_per_min NUMERIC NOT NULL,
  total_amount NUMERIC DEFAULT 0,
  total_minutes NUMERIC DEFAULT 0,
  seeker_rating INTEGER CHECK (seeker_rating >= 1 AND seeker_rating <= 5),
  seeker_feedback TEXT
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  type TEXT NOT NULL CHECK (type IN ('recharge', 'debit', 'earning')),
  amount NUMERIC NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  session_id UUID REFERENCES sessions(id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id),
  seeker_id UUID NOT NULL REFERENCES profiles(id),
  listener_id UUID NOT NULL REFERENCES profiles(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS st_user_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id),
  reported_id UUID NOT NULL REFERENCES profiles(id),
  session_id UUID REFERENCES sessions(id),
  reason TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listener_profiles_online ON listener_profiles(is_online) WHERE is_online = TRUE;
CREATE INDEX IF NOT EXISTS idx_sessions_seeker ON sessions(seeker_id);
CREATE INDEX IF NOT EXISTS idx_sessions_listener ON sessions(listener_id);
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id, created_at DESC);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listener_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE st_user_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile except wallet" ON profiles;
CREATE POLICY "Users can update own profile except wallet" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Seekers can read approved listener public info" ON profiles;
CREATE POLICY "Seekers can read approved listener public info" ON profiles FOR SELECT USING (
  role = 'listener' AND EXISTS (
    SELECT 1 FROM listener_profiles lp WHERE lp.id = profiles.id AND lp.status = 'approved'
  )
);

DROP POLICY IF EXISTS "Anyone authenticated can read approved listeners" ON listener_profiles;
CREATE POLICY "Anyone authenticated can read approved listeners" ON listener_profiles FOR SELECT USING (status = 'approved' OR auth.uid() = id);

DROP POLICY IF EXISTS "Listeners can update own profile" ON listener_profiles;
CREATE POLICY "Listeners can update own profile" ON listener_profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Listeners can insert own profile" ON listener_profiles;
CREATE POLICY "Listeners can insert own profile" ON listener_profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Participants can read own sessions" ON sessions;
CREATE POLICY "Participants can read own sessions" ON sessions FOR SELECT USING (auth.uid() = seeker_id OR auth.uid() = listener_id);

DROP POLICY IF EXISTS "Seekers can create sessions" ON sessions;
CREATE POLICY "Seekers can create sessions" ON sessions FOR INSERT WITH CHECK (auth.uid() = seeker_id);

DROP POLICY IF EXISTS "Participants can update sessions" ON sessions;
CREATE POLICY "Participants can update sessions" ON sessions FOR UPDATE USING (auth.uid() = seeker_id OR auth.uid() = listener_id);

DROP POLICY IF EXISTS "Session participants can read messages" ON messages;
CREATE POLICY "Session participants can read messages" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM sessions s WHERE s.id = messages.session_id AND (s.seeker_id = auth.uid() OR s.listener_id = auth.uid()))
);

DROP POLICY IF EXISTS "Session participants can send messages" ON messages;
CREATE POLICY "Session participants can send messages" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND EXISTS (
    SELECT 1 FROM sessions s WHERE s.id = messages.session_id AND s.status = 'active' AND (s.seeker_id = auth.uid() OR s.listener_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can read own transactions" ON transactions;
CREATE POLICY "Users can read own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read reviews for listeners" ON session_reviews;
CREATE POLICY "Users can read reviews for listeners" ON session_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Seekers can insert reviews" ON session_reviews;
CREATE POLICY "Seekers can insert reviews" ON session_reviews FOR INSERT WITH CHECK (auth.uid() = seeker_id);

DROP POLICY IF EXISTS "Users can insert st reports" ON st_user_reports;
CREATE POLICY "Users can insert st reports" ON st_user_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can read own st reports" ON st_user_reports;
CREATE POLICY "Users can read own st reports" ON st_user_reports FOR SELECT USING (auth.uid() = reporter_id);

CREATE OR REPLACE FUNCTION prevent_wallet_client_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.wallet_balance IS DISTINCT FROM OLD.wallet_balance THEN
    IF current_setting('request.jwt.claim.role', true) = 'authenticated' THEN
      NEW.wallet_balance := OLD.wallet_balance;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS protect_wallet_balance ON profiles;
CREATE TRIGGER protect_wallet_balance BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION prevent_wallet_client_update();

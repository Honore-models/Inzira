-- ============================================================
-- INZIRA DATABASE SCHEMA
-- Run this in Supabase SQL Editor to set up all tables
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (linked to auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('youth', 'officer')),
  password_hash TEXT NOT NULL,

  -- Youth-specific fields
  goal TEXT,
  skills TEXT,
  situation TEXT,
  district TEXT,
  sector TEXT,

  -- Officer-specific fields
  department TEXT,
  district_assigned TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- YOUTH CASES (managed by officers)
-- ============================================================
CREATE TABLE youth_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  youth_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  officer_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  current_step INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROADMAP STEPS
-- ============================================================
CREATE TABLE roadmap_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES youth_cases(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  detail TEXT,
  institution TEXT,
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('done', 'current', 'locked')),
  state TEXT NOT NULL DEFAULT 'locked' CHECK (state IN ('done', 'current', 'locked')),
  location TEXT,
  source TEXT,
  due_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(case_id, step_number)
);

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES youth_cases(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('youth', 'officer', 'ai')),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INSTITUTIONS (verified library)
-- ============================================================
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  category TEXT CHECK (category IN ('Business', 'Training', 'Loans')),
  initials TEXT,
  logo_bg TEXT,
  logo_url TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AI GENERATED ROADMAPS (drafts)
-- ============================================================
CREATE TABLE ai_roadmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES youth_cases(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'reviewed', 'approved', 'sent')),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_youth_cases_youth ON youth_cases(youth_profile_id);
CREATE INDEX idx_youth_cases_officer ON youth_cases(officer_profile_id);
CREATE INDEX idx_roadmap_steps_case ON roadmap_steps(case_id);
CREATE INDEX idx_messages_case ON messages(case_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE youth_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_roadmaps ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Profiles: officers can view all youth profiles
CREATE POLICY "Officers can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'officer'
    )
  );

-- Youth cases: officers can manage all, youth can view their own
CREATE POLICY "Officers can manage all cases"
  ON youth_cases FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'officer'
    )
  );

CREATE POLICY "Youth can view own cases"
  ON youth_cases FOR SELECT
  USING (
    youth_profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Roadmap steps: follow youth_cases permissions
CREATE POLICY "Officers can manage all roadmap steps"
  ON roadmap_steps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'officer'
    )
  );

CREATE POLICY "Youth can view own roadmap steps"
  ON roadmap_steps FOR SELECT
  USING (
    case_id IN (
      SELECT id FROM youth_cases
      WHERE youth_profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Messages: participants can view, sender can insert
CREATE POLICY "Participants can view messages"
  ON messages FOR SELECT
  USING (
    case_id IN (
      SELECT id FROM youth_cases
      WHERE youth_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
         OR officer_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Institutions: everyone can read
CREATE POLICY "Anyone can view institutions"
  ON institutions FOR SELECT
  USING (true);

-- AI Roadmaps: follow youth_cases permissions
CREATE POLICY "Officers can manage roadmaps"
  ON ai_roadmaps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'officer'
    )
  );

CREATE POLICY "Youth can view own roadmaps"
  ON ai_roadmaps FOR SELECT
  USING (
    case_id IN (
      SELECT id FROM youth_cases
      WHERE youth_profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================
-- SEED DATA (institutions)
-- ============================================================
INSERT INTO institutions (title, description, location, category, initials, logo_bg, details) VALUES
(
  'RDB - Rwanda Development Board',
  'Business registration, licenses, and investment support',
  'Nyarugenge, Kigali',
  'Business',
  'RDB',
  '#1f6f4c',
  '{"fullDescription": "The Rwanda Development Board is the national agency responsible for business registration, investment promotion, and private sector development.", "services": ["Business name registration", "Company and investment licenses", "Startup support and incubation", "Investment incentives and guidance"], "phone": "+250 788 185 400", "email": "info@rdb.rw", "hours": "Mon - Fri, 8:00 AM - 5:00 PM", "address": "Kigali City Tower, Avenue du Travail, Kigali"}'
),
(
  'RTB / TVET Rwanda',
  'Vocational training programs and skills certification',
  'Musanze',
  'Training',
  'RTB',
  '#2f5f46',
  '{"fullDescription": "RTB / TVET Rwanda coordinates technical and vocational education and training across the country.", "services": ["Vocational skills training", "National TVET certificates", "Career guidance and placement", "Short professional courses"], "phone": "+250 788 305 100", "email": "info@rtb.rw", "hours": "Mon - Fri, 7:30 AM - 5:00 PM", "address": "TVET Headquarters, Kigali"}'
),
(
  'BDF - Business Development Fund',
  'Loan guarantees for youth and small businesses',
  'Musanze',
  'Loans',
  'BDF',
  '#15583b',
  '{"fullDescription": "The Business Development Fund provides loan guarantees and affordable financing to small businesses and young entrepreneurs.", "services": ["Loan guarantees for SMEs", "Youth and women financing", "Business advisory and coaching", "Loan application support"], "phone": "+250 788 180 300", "email": "info@bdf.rw", "hours": "Mon - Fri, 8:00 AM - 5:00 PM", "address": "KK 15 Rd, Kigali"}'
),
(
  'RRA - Rwanda Revenue Authority',
  'Tax office for TIN registration and compliance',
  'Musanze',
  'Business',
  'RRA',
  '#3b6b52',
  '{"fullDescription": "The Rwanda Revenue Authority is the national tax administration. It issues Tax Identification Numbers (TINs).", "services": ["TIN registration", "Tax filing and compliance support", "Taxpayer education", "E-services online portal"], "phone": "+250 788 180 000", "email": "info@rra.gov.rw", "hours": "Mon - Fri, 7:00 AM - 6:00 PM", "address": "RRA Headquarters, Boulevard de l Umuganda, Kigali"}'
);

-- ============================================================
-- FUNCTION: Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_youth_cases_updated_at
  BEFORE UPDATE ON youth_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_roadmap_steps_updated_at
  BEFORE UPDATE ON roadmap_steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

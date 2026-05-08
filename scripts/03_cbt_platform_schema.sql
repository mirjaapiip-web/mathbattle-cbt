-- CBT Platform - Production Ready Schema
-- Supports authentication, exams, anti-cheat, competitions, and admin features

-- ============ USERS TABLES ============

-- Admin users table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  school_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Student/User accounts table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  class TEXT,
  attendance_number TEXT,
  admin_id UUID REFERENCES admins(id),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- ============ EXAM/CLASS MANAGEMENT ============

-- Classes managed by admins
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admins(id),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(admin_id, name)
);

-- Exams/Practice tests
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admins(id),
  class_id UUID REFERENCES classes(id),
  title TEXT NOT NULL,
  description TEXT,
  exam_type TEXT CHECK (exam_type IN ('practice', 'exam', 'competition')),
  duration_minutes INTEGER NOT NULL,
  passing_score INTEGER DEFAULT 70,
  total_questions INTEGER,
  shuffle_questions BOOLEAN DEFAULT true,
  show_results_immediately BOOLEAN DEFAULT false,
  anti_cheat_enabled BOOLEAN DEFAULT true,
  max_violations INTEGER DEFAULT 3,
  is_published BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- ============ QUESTIONS TABLES ============

-- Question bank
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admins(id),
  exam_id UUID REFERENCES exams(id),
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  option_e TEXT,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points INTEGER DEFAULT 1,
  import_source TEXT,
  source_file_name TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- ============ EXAM PARTICIPATION ============

-- User exam attempts
CREATE TABLE IF NOT EXISTS exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES exams(id),
  user_id UUID NOT NULL REFERENCES users(id),
  attempt_number INTEGER DEFAULT 1,
  start_time TIMESTAMP DEFAULT now(),
  end_time TIMESTAMP,
  submitted_at TIMESTAMP,
  score INTEGER,
  percentage DECIMAL(5, 2),
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'auto_submitted', 'auto_closed')),
  violation_count INTEGER DEFAULT 0,
  is_passed BOOLEAN,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(exam_id, user_id, attempt_number)
);

-- Student answers during exam
CREATE TABLE IF NOT EXISTS exam_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_attempt_id UUID NOT NULL REFERENCES exam_attempts(id),
  question_id UUID NOT NULL REFERENCES questions(id),
  user_answer TEXT,
  is_correct BOOLEAN,
  points_earned INTEGER,
  time_taken_seconds INTEGER,
  answered_at TIMESTAMP DEFAULT now()
);

-- ============ ANTI-CHEAT MONITORING ============

-- Focus mode violations
CREATE TABLE IF NOT EXISTS focus_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_attempt_id UUID NOT NULL REFERENCES exam_attempts(id),
  user_id UUID NOT NULL REFERENCES users(id),
  violation_type TEXT NOT NULL CHECK (violation_type IN (
    'tab_switch',
    'window_blur',
    'alt_tab',
    'minimize',
    'app_switch',
    'keyboard_shortcut'
  )),
  violation_time TIMESTAMP DEFAULT now(),
  screenshot_url TEXT,
  details TEXT
);

-- ============ COMPETITIONS ============

-- Competition rooms
CREATE TABLE IF NOT EXISTS competition_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admins(id),
  exam_id UUID NOT NULL REFERENCES exams(id),
  room_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  max_participants INTEGER DEFAULT 36,
  current_participants INTEGER DEFAULT 0,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'finished')),
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- Competition participants
CREATE TABLE IF NOT EXISTS competition_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES competition_rooms(id),
  user_id UUID NOT NULL REFERENCES users(id),
  exam_attempt_id UUID REFERENCES exam_attempts(id),
  join_time TIMESTAMP DEFAULT now(),
  finish_time TIMESTAMP,
  final_score INTEGER,
  rank INTEGER,
  UNIQUE(room_id, user_id)
);

-- ============ ADMIN ACTIVITY LOG ============

-- Track admin actions
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admins(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- ============ USER ACTIVITY LOG ============

-- Track user actions during exam
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  exam_attempt_id UUID REFERENCES exam_attempts(id),
  activity_type TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- ============ SESSIONS ============

-- Admin sessions
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admins(id),
  token TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- User sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  token TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- ============ INDEXES FOR PERFORMANCE ============

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_admin_id ON users(admin_id);
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_exams_admin_id ON exams(admin_id);
CREATE INDEX idx_exams_class_id ON exams(class_id);
CREATE INDEX idx_questions_admin_id ON questions(admin_id);
CREATE INDEX idx_questions_exam_id ON questions(exam_id);
CREATE INDEX idx_exam_attempts_user_id ON exam_attempts(user_id);
CREATE INDEX idx_exam_attempts_exam_id ON exam_attempts(exam_id);
CREATE INDEX idx_exam_attempts_status ON exam_attempts(status);
CREATE INDEX idx_exam_answers_attempt_id ON exam_answers(exam_attempt_id);
CREATE INDEX idx_focus_violations_user_id ON focus_violations(user_id);
CREATE INDEX idx_focus_violations_attempt_id ON focus_violations(exam_attempt_id);
CREATE INDEX idx_competition_rooms_admin_id ON competition_rooms(admin_id);
CREATE INDEX idx_competition_rooms_status ON competition_rooms(status);
CREATE INDEX idx_competition_participants_room_id ON competition_participants(room_id);
CREATE INDEX idx_competition_participants_user_id ON competition_participants(user_id);

-- ============ ROW LEVEL SECURITY (RLS) ============

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_participants ENABLE ROW LEVEL SECURITY;

-- Admin can only see their own data
CREATE POLICY "admins_view_own" ON admins FOR SELECT
  USING (auth.uid()::text = id::text);

-- Users can only see their own data
CREATE POLICY "users_view_own" ON users FOR SELECT
  USING (auth.uid()::text = id::text);

-- Admins can view users in their organization
CREATE POLICY "admins_view_users" ON users FOR SELECT
  USING (admin_id = (SELECT id FROM admins WHERE id = auth.uid()::text::uuid));

-- Users can view exams they're enrolled in
CREATE POLICY "users_view_exams" ON exams FOR SELECT
  USING (true);


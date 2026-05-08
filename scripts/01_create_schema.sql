-- Math Battle Arena Database Schema
-- This script creates all necessary tables for the MVP

-- Create users_stats table (extends auth.users with game stats)
CREATE TABLE IF NOT EXISTS users_stats (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  total_wins INT DEFAULT 0,
  total_games INT DEFAULT 0,
  total_score BIGINT DEFAULT 0,
  current_streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  difficulty_preference TEXT DEFAULT 'easy',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode TEXT NOT NULL CHECK (mode IN ('solo', 'multiplayer')),
  room_id TEXT, -- null for solo, unique for multiplayer rooms
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  max_players INT DEFAULT 1,
  current_players INT DEFAULT 0,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'finished')),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id)
);

-- Create game_questions table
CREATE TABLE IF NOT EXISTS game_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question TEXT NOT NULL,
  answer BIGINT NOT NULL,
  operation TEXT NOT NULL, -- '+', '-', '*', '/'
  num1 INT NOT NULL,
  num2 INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_responses table (player answers during a game)
CREATE TABLE IF NOT EXISTS game_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES game_questions(id) ON DELETE CASCADE,
  user_answer BIGINT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  response_time_ms INT NOT NULL, -- time to answer in milliseconds
  points_earned INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leaderboards table
CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rank INT,
  score BIGINT NOT NULL,
  games_played INT NOT NULL,
  win_rate DECIMAL(5, 2),
  period TEXT CHECK (period IN ('all_time', 'monthly', 'weekly', 'daily')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, period)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_stats_username ON users_stats(username);
CREATE INDEX IF NOT EXISTS idx_game_sessions_room_id ON game_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_game_responses_game_session ON game_responses(game_session_id);
CREATE INDEX IF NOT EXISTS idx_game_responses_user ON game_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_user ON leaderboards(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_period ON leaderboards(period);
CREATE INDEX IF NOT EXISTS idx_game_questions_difficulty ON game_questions(difficulty);

-- Enable RLS (Row Level Security)
ALTER TABLE users_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;

-- RLS Policy: users_stats - users can read all profiles but only update their own
CREATE POLICY "users_stats_read_all" ON users_stats
  FOR SELECT
  USING (true);

CREATE POLICY "users_stats_update_own" ON users_stats
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_stats_insert_own" ON users_stats
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policy: game_sessions - anyone can read, only system can write
CREATE POLICY "game_sessions_read_all" ON game_sessions
  FOR SELECT
  USING (true);

-- RLS Policy: game_questions - only read, no user writes
CREATE POLICY "game_questions_read_all" ON game_questions
  FOR SELECT
  USING (true);

-- RLS Policy: game_responses - users can read their own responses
CREATE POLICY "game_responses_read_own" ON game_responses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "game_responses_insert_own" ON game_responses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: leaderboards - anyone can read, system updates
CREATE POLICY "leaderboards_read_all" ON leaderboards
  FOR SELECT
  USING (true);

// User and authentication types
export interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  total_wins: number;
  total_games: number;
  total_score: bigint;
  current_streak: number;
  best_streak: number;
  difficulty_preference: 'easy' | 'medium' | 'hard';
  created_at: string;
  updated_at: string;
}

// Game session types
export interface GameSession {
  id: string;
  mode: 'solo' | 'multiplayer';
  room_id?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  max_players: number;
  current_players: number;
  status: 'waiting' | 'active' | 'finished';
  started_at?: string;
  ended_at?: string;
  created_at: string;
}

// Question type
export interface GameQuestion {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  num1: number;
  num2: number;
  operation: '+' | '-' | '*' | '/';
  answer: number;
  created_at: string;
}

// Player response to a question
export interface GameResponse {
  id: string;
  game_session_id: string;
  user_id: string;
  question_id: string;
  user_answer: number;
  is_correct: boolean;
  response_time_ms: number;
  points_earned: number;
  created_at: string;
}

// Leaderboard entry
export interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  rank: number;
  score: bigint;
  games_played: number;
  win_rate: number;
  period: 'all_time' | 'monthly' | 'weekly' | 'daily';
  updated_at: string;
}

// Real-time game state for Socket.io
export interface GameState {
  sessionId: string;
  roomId?: string;
  question: GameQuestion;
  questionIndex: number;
  totalQuestions: number;
  players: PlayerState[];
  status: 'waiting' | 'question' | 'answering' | 'finished';
  timeRemaining: number;
}

export interface PlayerState {
  userId: string;
  username: string;
  score: number;
  streak: number;
  answered: boolean;
  isCorrect?: boolean;
  responseTime?: number;
}

// Socket.io event types
export interface SocketEvents {
  // Client -> Server
  'join-room': { roomId: string; difficulty: 'easy' | 'medium' | 'hard' };
  'start-game': { sessionId: string };
  'submit-answer': { sessionId: string; answer: number; responseTime: number };
  'leave-room': { roomId: string };

  // Server -> Client
  'room-updated': { players: PlayerState[]; currentPlayers: number };
  'game-started': { gameState: GameState };
  'new-question': { question: GameQuestion; timeLimit: number };
  'answer-revealed': { correctAnswer: number; playerScores: PlayerState[] };
  'game-finished': { finalScores: PlayerState[]; winner?: PlayerState };
  'error': { message: string };
}

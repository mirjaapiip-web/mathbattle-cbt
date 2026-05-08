import { supabase } from './supabase';
import { GameQuestion, GameResponse } from './types';

// Get random questions from the database
export async function getRandomQuestions(difficulty: 'easy' | 'medium' | 'hard', count: number) {
  try {
    const { data, error } = await supabase
      .from('game_questions')
      .select('*')
      .eq('difficulty', difficulty)
      .order('RANDOM()')
      .limit(count);

    if (error) {
      console.error('[v0] Failed to fetch questions:', error);
      throw error;
    }
    return data as GameQuestion[];
  } catch (error) {
    console.error('[v0] Database error in getRandomQuestions:', error);
    // Return empty array instead of throwing to allow page to render
    return [];
  }
}

// Calculate points based on difficulty and response time
export function calculatePoints(difficulty: 'easy' | 'medium' | 'hard', responseTimeMs: number): number {
  const basePoints = {
    easy: 100,
    medium: 200,
    hard: 300,
  };

  const timeBonus = Math.max(0, 5000 - responseTimeMs) / 1000;
  return Math.max(basePoints[difficulty], Math.floor(basePoints[difficulty] + timeBonus * 50));
}

// Record a game response
export async function recordGameResponse(
  gameSessionId: string,
  userId: string,
  questionId: string,
  userAnswer: number,
  correctAnswer: number,
  responseTimeMs: number,
  difficulty: 'easy' | 'medium' | 'hard'
) {
  try {
    const isCorrect = userAnswer === correctAnswer;
    const pointsEarned = isCorrect ? calculatePoints(difficulty, responseTimeMs) : 0;

    const { data, error } = await supabase
      .from('game_responses')
      .insert({
        game_session_id: gameSessionId,
        user_id: userId,
        question_id: questionId,
        user_answer: userAnswer,
        is_correct: isCorrect,
        response_time_ms: responseTimeMs,
        points_earned: pointsEarned,
      })
      .select()
      .single();

    if (error) throw error;
    return { response: data as GameResponse, pointsEarned };
  } catch (error) {
    console.error('[v0] Database error in recordGameResponse:', error);
    return { response: null, pointsEarned: 0 };
  }
}

// Get user profile
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users_stats')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // User doesn't have a profile yet, create one
      return null;
    }

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[v0] Database error in getUserProfile:', error);
    return null;
  }
}

// Create or update user profile
export async function createUserProfile(userId: string, username: string) {
  try {
    const { data, error } = await supabase
      .from('users_stats')
      .upsert({
        id: userId,
        username,
        total_wins: 0,
        total_games: 0,
        total_score: 0,
        current_streak: 0,
        best_streak: 0,
        difficulty_preference: 'easy',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[v0] Database error in createUserProfile:', error);
    return null;
  }
}

// Update user stats after game completion
export async function updateUserStats(
  userId: string,
  won: boolean,
  totalScore: number,
  correctAnswers: number
) {
  try {
    const { data, error } = await supabase.rpc(
      'update_user_game_stats',
      {
        p_user_id: userId,
        p_won: won,
        p_game_score: totalScore,
        p_correct_answers: correctAnswers,
      }
    );

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[v0] Database error in updateUserStats:', error);
    return null;
  }
}

// Get leaderboard
export async function getLeaderboard(period: 'all_time' | 'monthly' | 'weekly' | 'daily' = 'all_time', limit: number = 100) {
  try {
    const { data, error } = await supabase
      .from('leaderboards')
      .select('*')
      .eq('period', period)
      .order('rank', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[v0] Database error in getLeaderboard:', error);
    return [];
  }
}

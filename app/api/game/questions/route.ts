import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getRandomQuestions, recordGameResponse, updateUserStats } from '@/lib/api';

// Get a random set of questions for a game
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const difficulty = searchParams.get('difficulty') || 'easy';
  const count = parseInt(searchParams.get('count') || '10');

  try {
    const questions = await getRandomQuestions(
      difficulty as 'easy' | 'medium' | 'hard',
      count
    );
    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

// Submit answer and record response
export async function POST(request: NextRequest) {
  const { gameSessionId, questionId, answer, responseTime, difficulty } = await request.json();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    // Get correct answer from question
    const { data: question, error: qError } = await supabase
      .from('game_questions')
      .select('answer')
      .eq('id', questionId)
      .single();

    if (qError || !question) {
      throw new Error('Question not found');
    }

    const { response, pointsEarned } = await recordGameResponse(
      gameSessionId,
      user.id,
      questionId,
      answer,
      question.answer,
      responseTime,
      difficulty
    );

    return NextResponse.json({
      isCorrect: response.is_correct,
      pointsEarned,
      correctAnswer: question.answer,
    });
  } catch (error) {
    console.error('Error recording response:', error);
    return NextResponse.json(
      { error: 'Failed to record response' },
      { status: 500 }
    );
  }
}

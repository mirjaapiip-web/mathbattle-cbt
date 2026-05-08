'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from '@/lib/session-context';
import { getRandomQuestions, calculatePoints, recordGameResponse } from '@/lib/api';
import { GameQuestion } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function SoloGameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useSession();
  const difficulty = (searchParams.get('difficulty') || 'easy') as 'easy' | 'medium' | 'hard';

  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [gameActive, setGameActive] = useState(true);
  const [sessionId, setSessionId] = useState<string>('');
  const [startTime, setStartTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState(30);

  // Load questions on mount
  useEffect(() => {
    const initGame = async () => {
      if (!user) return;

      try {
        const qs = await getRandomQuestions(difficulty, 10);
        setQuestions(qs);
        setSessionId(`solo_${user.id}_${Date.now()}`);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load questions:', error);
        router.push('/dashboard');
      }
    };

    initGame();
  }, [user, difficulty, router]);

  // Timer effect
  useEffect(() => {
    if (!gameActive || timeLeft <= 0 || loading) return;

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, gameActive, loading]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && gameActive && !loading) {
      handleSubmitAnswer();
    }
  }, [timeLeft, gameActive, loading]);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleSubmitAnswer = useCallback(async () => {
    if (!currentQuestion || !answer || !gameActive) return;

    const userAnswer = parseInt(answer);
    const correctAnswer = currentQuestion.correct_answer;
    const responseTime = Date.now() - startTime;

    const isCorrect = userAnswer === correctAnswer;

    if (isCorrect) {
      setScore(score + calculatePoints(difficulty, responseTime));
      setStreak(streak + 1);
    } else {
      setStreak(0);
    }

    // Record response
    await recordGameResponse(
      sessionId,
      user?.id || '',
      currentQuestion.id || '',
      userAnswer,
      correctAnswer,
      responseTime,
      difficulty
    );

    // Move to next question or end game
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswer('');
      setTimeLeft(30);
      setStartTime(Date.now());
    } else {
      setGameActive(false);
    }
  }, [currentQuestion, answer, gameActive, score, streak, difficulty, currentIndex, questions.length, user, sessionId, startTime]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitAnswer();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading game...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="bg-card border-border max-w-md">
          <CardContent className="pt-6">
            <p className="text-foreground mb-4">No questions available. Please try again.</p>
            <Button onClick={() => router.push('/dashboard')} className="w-full bg-primary hover:bg-primary/90">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!gameActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md bg-card border-border">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Game Over!</p>
                <p className="text-4xl font-bold text-primary">{score}</p>
                <p className="text-sm text-muted-foreground mt-1">Final Score</p>
              </div>

              <div className="grid grid-cols-3 gap-4 py-4 border-y border-border">
                <div>
                  <p className="text-2xl font-bold text-accent">{currentIndex}</p>
                  <p className="text-xs text-muted-foreground">Questions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-secondary">{streak}</p>
                  <p className="text-xs text-muted-foreground">Streak</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {Math.round((currentIndex / questions.length) * 100)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Accuracy</p>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Back to Dashboard
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-background"
                >
                  Play Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => router.push('/dashboard')}
            variant="ghost"
            className="text-foreground hover:bg-card"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit
          </Button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Question {currentIndex + 1}/{questions.length}
            </p>
            <div className="w-64 h-2 bg-border rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Score</p>
            <p className="text-2xl font-bold text-primary">{score}</p>
          </div>
        </div>

        {/* Game Card */}
        <Card className="bg-card border-border shadow-lg">
          <CardContent className="pt-12 pb-12">
            <div className="space-y-8">
              {/* Question */}
              <div className="text-center space-y-2">
                <p className="text-lg text-muted-foreground font-medium">
                  {currentQuestion?.question || 'Loading...'}
                </p>
                <p className="text-sm text-muted-foreground capitalize">
                  Difficulty: {difficulty}
                </p>
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-2 gap-3">
                {currentQuestion?.options?.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => setAnswer(option.toString())}
                    className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                      answer === option.toString()
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-foreground hover:border-primary/50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {/* Timer */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Time Left</p>
                <div className={`text-4xl font-bold ${
                  timeLeft <= 10 ? 'text-destructive' : 'text-accent'
                }`}>
                  {timeLeft}s
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmitAnswer}
                disabled={!answer || !gameActive}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold"
              >
                Submit Answer
              </Button>

              {/* Streak Display */}
              {streak > 0 && (
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Streak</p>
                  <p className="text-3xl font-bold text-accent">{streak} 🔥</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Clock, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Question {
  id: string;
  question: string;
  options: { A: string; B: string; C: string; D?: string; E?: string };
  correctAnswer: string;
}

interface FocusViolation {
  type: string;
  time: number;
}

export default function ExamPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const [exam, setExam] = useState({
    title: 'Mathematics Final Exam',
    duration: 120,
    totalQuestions: 50,
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violations, setViolations] = useState<FocusViolation[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('user_token');
    const userData = localStorage.getItem('user_data');

    if (!token || !userData) {
      router.push('/user-login');
      return;
    }

    setUser(JSON.parse(userData));

    // Mock questions
    const mockQuestions: Question[] = [
      {
        id: '1',
        question: 'What is the value of 2 + 2?',
        options: { A: '3', B: '4', C: '5', D: '6' },
        correctAnswer: 'B',
      },
      {
        id: '2',
        question: 'What is the square root of 16?',
        options: { A: '2', B: '3', C: '4', D: '5' },
        correctAnswer: 'C',
      },
    ];

    setQuestions(mockQuestions);

    // Request fullscreen
    const enterFullscreen = async () => {
      try {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      } catch (error) {
        console.error('Fullscreen error:', error);
      }
    };

    enterFullscreen();
  }, [router]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmitExam();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Focus mode monitoring
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation('tab_switch');
      }
    };

    const handleBlur = () => {
      recordViolation('window_blur');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'Tab') {
        recordViolation('alt_tab');
        e.preventDefault();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const recordViolation = (type: string) => {
    const newViolations = [...violations, { type, time: Date.now() }];
    setViolations(newViolations);

    if (newViolations.length >= 3) {
      setShowWarning(true);
      setTimeout(() => {
        handleSubmitExam();
      }, 3000);
    } else if (newViolations.length > 0) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    }
  };

  const handleSubmitExam = async () => {
    // Calculate score
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[String(idx)] === q.correctAnswer) {
        score++;
      }
    });

    try {
      // Send results to backend
      await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId,
          userId: user?.id,
          answers,
          score,
          violations: violations.length,
          timeSpent: exam.duration * 60 - timeLeft,
        }),
      });

      router.push(`/exam-results/${examId}`);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (!questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading exam...</p>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-background flex flex-col"
    >
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">{exam.title}</h1>
            <p className="text-xs text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>

          {/* Timer */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              timeLeft < 300
                ? 'bg-destructive/20 text-destructive'
                : 'bg-primary/20 text-primary'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="font-mono font-bold text-lg">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-background">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-card border-border max-w-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4 text-destructive">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="font-bold">Focus Mode Violation</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                You have {violations.length} violation(s). Continuing to violate focus mode will result in automatic exam closure.
              </p>
              <Button
                onClick={() => setShowWarning(false)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Continue Exam
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 flex gap-8">
        {/* Question Area */}
        <div className="flex-1 space-y-6">
          <Card className="bg-card border-border">
            <CardContent className="pt-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  {currentQ.question}
                </h2>

                <div className="space-y-3">
                  {Object.entries(currentQ.options).map(([key, value]) => (
                    <label
                      key={key}
                      className="flex items-center p-3 border border-border rounded-lg cursor-pointer hover:bg-background/50 transition-colors"
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={key}
                        checked={answers[String(currentQuestion)] === key}
                        onChange={(e) => {
                          const newAnswers = { ...answers };
                          newAnswers[String(currentQuestion)] = e.target.value;
                          setAnswers(newAnswers);
                        }}
                        className="mr-3"
                      />
                      <span className="font-semibold text-foreground mr-3">{key}:</span>
                      <span className="text-muted-foreground">{value}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex gap-3">
            <Button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              variant="outline"
              className="border-border text-foreground hover:bg-background"
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
              disabled={currentQuestion === questions.length - 1}
              variant="outline"
              className="border-border text-foreground hover:bg-background"
            >
              Next
            </Button>
            <Button
              onClick={handleSubmitExam}
              className="ml-auto bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Submit Exam
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-64 space-y-4">
          {/* Violations */}
          {violations.length > 0 && (
            <Card className="bg-destructive/10 border-destructive/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <p className="font-semibold text-sm">Focus Violations</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {violations.length} violation(s) recorded
                </p>
              </CardContent>
            </Card>
          )}

          {/* Question Navigator */}
          <Card className="bg-card border-border">
            <CardContent className="pt-4">
              <p className="text-sm font-semibold text-foreground mb-3">Questions</p>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`w-full aspect-square rounded text-xs font-semibold transition-colors ${
                      idx === currentQuestion
                        ? 'bg-primary text-primary-foreground'
                        : answers[String(idx)]
                        ? 'bg-green-500/20 text-green-600 border border-green-500/30'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}

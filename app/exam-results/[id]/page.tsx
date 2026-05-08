'use client';

import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, BarChart3, Home } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function ExamResultsPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  // Mock results
  const results = {
    examTitle: 'Mathematics Final Exam',
    score: 85,
    maxScore: 100,
    percentage: 85,
    passed: true,
    totalQuestions: 50,
    correctAnswers: 42,
    timeSpent: 95,
    violations: 0,
  };

  const isPassed = results.percentage >= 70;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl bg-card border-border shadow-xl">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-4">
            <div
              className={`p-4 rounded-full ${
                isPassed ? 'bg-green-500/20' : 'bg-destructive/20'
              }`}
            >
              {isPassed ? (
                <CheckCircle className="w-12 h-12 text-green-500" />
              ) : (
                <AlertCircle className="w-12 h-12 text-destructive" />
              )}
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">
            {isPassed ? 'Exam Passed' : 'Exam Completed'}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-lg">
            {results.examTitle}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Score Display */}
          <div className="text-center">
            <div className="mb-4">
              <p className="text-6xl font-bold text-primary mb-2">
                {results.percentage}%
              </p>
              <p className="text-muted-foreground">
                {results.correctAnswers} out of {results.totalQuestions} questions correct
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                label: 'Score',
                value: `${results.score}/${results.maxScore}`,
                icon: BarChart3,
              },
              {
                label: 'Time Spent',
                value: `${Math.floor(results.timeSpent / 60)}m ${results.timeSpent % 60}s`,
                icon: null,
              },
              {
                label: 'Violations',
                value: results.violations,
                icon: null,
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="p-4 bg-background rounded-lg border border-border text-center">
                  {Icon && <Icon className="w-6 h-6 text-primary mx-auto mb-2" />}
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* Feedback */}
          {isPassed && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-600 font-semibold">
                Great job! You passed this exam. Keep up the excellent work!
              </p>
            </div>
          )}

          {!isPassed && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-amber-600 font-semibold">
                You can retake this exam to improve your score. Focus on the topics you found challenging.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              asChild
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Link href="/user-dashboard">Back to Dashboard</Link>
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-border text-foreground hover:bg-background"
              asChild
            >
              <Link href={`/exam-review/${examId}`}>Review Answers</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

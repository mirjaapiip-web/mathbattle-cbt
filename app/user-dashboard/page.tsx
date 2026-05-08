'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, BookOpen, BarChart3, Clock } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface User {
  id: string;
  email: string;
  fullName: string;
  class: string;
  attendanceNumber: string;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalQuestions: number;
  status: 'available' | 'completed' | 'attempted';
  score?: number;
  attemptCount?: number;
}

export default function UserDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    completedExams: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('user_token');
    const userData = localStorage.getItem('user_data');

    if (!token || !userData) {
      router.push('/user-login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setLoading(false);

      // Mock exam data
      const mockExams: Exam[] = [
        {
          id: '1',
          title: 'Mathematics Final Exam',
          description: 'Comprehensive mathematics exam covering algebra, geometry, and calculus',
          duration: 120,
          totalQuestions: 50,
          status: 'available',
        },
        {
          id: '2',
          title: 'English Placement Test',
          description: 'English language proficiency assessment',
          duration: 90,
          totalQuestions: 40,
          status: 'completed',
          score: 85,
        },
        {
          id: '3',
          title: 'Physics Midterm',
          description: 'Physics concepts midterm examination',
          duration: 100,
          totalQuestions: 45,
          status: 'attempted',
          score: 72,
          attemptCount: 1,
        },
      ];

      setExams(mockExams);
      setStats({
        totalAttempts: 8,
        averageScore: 78,
        completedExams: 5,
      });
    } catch (error) {
      router.push('/user-login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_data');
    router.push('/user-login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Student Dashboard</h1>
            <p className="text-sm text-muted-foreground">{user?.class} - {user?.fullName}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-border text-foreground hover:bg-background"
            size="sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: 'Total Attempts', value: stats.totalAttempts, icon: Clock },
            { label: 'Average Score', value: `${stats.averageScore}%`, icon: BarChart3 },
            { label: 'Completed Exams', value: stats.completedExams, icon: BookOpen },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-muted-foreground">{stat.label}</CardDescription>
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Available Exams */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Available Exams</h2>
            <p className="text-muted-foreground">Select an exam to begin</p>
          </div>

          <div className="grid gap-4">
            {exams.map((exam) => (
              <Card key={exam.id} className="bg-card border-border hover:border-primary transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-foreground">{exam.title}</CardTitle>
                      <CardDescription className="text-muted-foreground">{exam.description}</CardDescription>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        exam.status === 'available'
                          ? 'bg-primary/20 text-primary'
                          : exam.status === 'completed'
                          ? 'bg-green-500/20 text-green-600'
                          : 'bg-accent/20 text-accent'
                      }`}
                    >
                      {exam.status === 'available' ? 'Available' : exam.status === 'completed' ? 'Completed' : 'Attempted'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {exam.duration} mins
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {exam.totalQuestions} questions
                      </div>
                      {exam.score && (
                        <div className="flex items-center gap-1">
                          <BarChart3 className="w-4 h-4" />
                          Score: {exam.score}%
                        </div>
                      )}
                    </div>
                    {exam.status === 'available' ? (
                      <Button
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        asChild
                      >
                        <Link href={`/user-exams/${exam.id}`}>Start Exam</Link>
                      </Button>
                    ) : exam.status === 'completed' ? (
                      <Button variant="outline" className="border-border text-foreground hover:bg-background">
                        View Results
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="border-border text-foreground hover:bg-background"
                        asChild
                      >
                        <Link href={`/user-exams/${exam.id}`}>Resume</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

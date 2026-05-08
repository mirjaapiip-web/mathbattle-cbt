'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/session-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2, Users, LogOut, TrendingUp } from 'lucide-react';
import Link from 'next/link';

// Mark this page as dynamic to prevent prerendering issues
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const { user, loading, clearUser } = useSession();
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  useEffect(() => {
    if (!loading && (!user || user.role === 'admin')) {
      router.push('/entry');
    }
  }, [user, loading, router]);

  const handleLogout = () => {
    clearUser();
    router.push('/entry');
  };

  const handleSoloGame = () => {
    router.push(`/game/solo?difficulty=${difficulty}`);
  };

  const handleMultiplayerGame = () => {
    router.push(`/game/multiplayer?difficulty=${difficulty}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Math Battle Arena</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-foreground font-medium">{user.fullName}</p>
              <p className="text-sm text-muted-foreground">{user.class} • #{user.absenNumber}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-border text-foreground hover:bg-background"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome, {user.fullName}!
          </h2>
          <p className="text-muted-foreground">
            Choose a difficulty and start battling
          </p>
        </div>

        {/* Difficulty Selection */}
        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <CardTitle className="text-foreground">Select Difficulty</CardTitle>
            <CardDescription className="text-muted-foreground">
              Choose your skill level for this battle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`p-6 rounded-lg border-2 text-center transition-all ${
                    difficulty === level
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-background hover:border-primary/50'
                  }`}
                >
                  <p className="text-lg font-semibold text-foreground capitalize">
                    {level}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {level === 'easy' && 'Single digit math'}
                    {level === 'medium' && 'Double digit math'}
                    {level === 'hard' && 'Triple digit math'}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Game Mode Selection */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Solo Mode */}
          <Card className="bg-card border-border hover:border-primary transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Gamepad2 className="w-6 h-6 text-primary" />
                <CardTitle className="text-foreground">Solo Mode</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                Practice and improve your math skills at your own pace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                  10 questions per round
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                  30 seconds per question
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                  Time-based scoring
                </li>
              </ul>
              <Button
                onClick={handleSoloGame}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Play Solo
              </Button>
            </CardContent>
          </Card>

          {/* Multiplayer Mode */}
          <Card className="bg-card border-border hover:border-accent transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-accent" />
                <CardTitle className="text-foreground">Multiplayer</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                Compete in real-time against other players worldwide
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                  Up to 36 players per room
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                  Real-time leaderboard
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                  Instant results
                </li>
              </ul>
              <Button
                onClick={handleMultiplayerGame}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Find a Match
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section - Simplified */}
        <Card className="bg-card border-border mt-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-primary" />
              <CardTitle className="text-foreground">Session Info</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-2xl font-bold text-primary">{user.fullName}</p>
                <p className="text-sm text-muted-foreground">Player Name</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">{user.class}</p>
                <p className="text-sm text-muted-foreground">Class</p>
              </div>
              <div>
                <p className="text-lg font-bold text-secondary">{user.absenNumber}</p>
                <p className="text-sm text-muted-foreground">Attendance #</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Link */}
        <div className="mt-8 text-center">
          <Link href="/leaderboard">
            <Button variant="outline" className="border-border text-foreground hover:bg-card">
              View Global Leaderboard
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

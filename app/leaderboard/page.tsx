'use client';

import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/session-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trophy } from 'lucide-react';

// Mark this page as dynamic to prevent prerendering issues
export const dynamic = 'force-dynamic';

export default function LeaderboardPage() {
  const router = useRouter();
  const { user } = useSession();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            onClick={() => router.push('/dashboard')}
            variant="ghost"
            className="text-foreground hover:bg-background"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
          <div className="w-24" /> {/* Spacer for alignment */}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-foreground">Leaderboard</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Current session-based scores
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-6">
                Leaderboards are session-based. Play games to see your scores update!
              </p>
              <div className="bg-background rounded-lg p-6 mb-6">
                <div className="text-left space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <span className="text-sm text-muted-foreground">Your Session:</span>
                    <span className="font-mono text-primary text-sm">{user?.id.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <span className="text-sm text-muted-foreground">Player Name:</span>
                    <span className="font-semibold text-foreground">{user?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Class:</span>
                    <span className="font-semibold text-foreground">{user?.class}</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Start Playing Games
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/session-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users } from 'lucide-react';

// Mark this page as dynamic to prevent prerendering issues
export const dynamic = 'force-dynamic';

export default function MultiplayerPage() {
  const router = useRouter();
  const { user } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Button
            onClick={() => router.push('/dashboard')}
            variant="ghost"
            className="text-foreground hover:bg-background"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <Card className="bg-card border-border">
          <CardHeader className="text-center">
            <Users className="w-12 h-12 text-accent mx-auto mb-4" />
            <CardTitle className="text-2xl text-foreground">
              Multiplayer Coming Soon
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Socket.io infrastructure is ready for real-time multiplayer battles
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-8">
              Multiplayer functionality will allow you to:
            </p>
            <ul className="space-y-3 text-left max-w-sm mx-auto mb-8 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full"></span>
                Compete against up to 36 players in real-time
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full"></span>
                See live leaderboards during the match
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full"></span>
                Earn multiplier bonuses for correct answers
              </li>
            </ul>
            <Button
              onClick={() => router.push('/dashboard')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

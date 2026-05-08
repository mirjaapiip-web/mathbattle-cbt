'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Search, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function JoinCompetitionPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = localStorage.getItem('user_data');
      if (!user) {
        router.push('/user-login');
        return;
      }

      const userData = JSON.parse(user);

      // Find room by code (in real app, would call API)
      // For now, just navigate to room with code
      if (roomCode.length !== 6) {
        setError('Room code must be 6 characters');
        setLoading(false);
        return;
      }

      // Call join API
      const response = await fetch('/api/competition/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode,
          userId: userData.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to join room');
        setLoading(false);
        return;
      }

      const data = await response.json();
      router.push(`/competition/${data.data.room_id}`);
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-card border-border shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-accent rounded-lg">
              <Trophy className="w-6 h-6 text-accent-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">
            Join Competition
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter the room code provided by your instructor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/20 text-destructive rounded-md text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Room Code</label>
              <Input
                placeholder="E.g., MATH2024"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="bg-input border-border text-foreground text-center text-2xl font-bold tracking-widest"
                disabled={loading}
                required
              />
              <p className="text-xs text-muted-foreground">
                Ask your instructor for the 6-character room code
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || roomCode.length !== 6}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold gap-2"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Joining...' : 'Join Competition'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-background rounded-lg border border-border">
            <p className="text-xs text-muted-foreground text-center">
              Example room code: MATH2024
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

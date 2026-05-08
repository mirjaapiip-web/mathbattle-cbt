'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/session-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import Link from 'next/link';

// Mark this page as dynamic to prevent prerendering issues
export const dynamic = 'force-dynamic';

interface GameRoom {
  id: string;
  code: string;
  difficulty: 'easy' | 'medium' | 'hard';
  maxPlayers: number;
  currentPlayers: number;
  createdBy: string;
  createdAt: string;
  status: 'waiting' | 'active' | 'finished';
}

export default function CreateRoomPage() {
  const { user, loading, isAdmin } = useSession();
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [isCreating, setIsCreating] = useState(false);
  const [createdRoom, setCreatedRoom] = useState<GameRoom | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/entry');
    }
  }, [user, loading, isAdmin, router]);

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = async () => {
    if (!user) return;

    setIsCreating(true);
    try {
      const newRoom: GameRoom = {
        id: Math.random().toString(36).substring(7),
        code: generateRoomCode(),
        difficulty,
        maxPlayers,
        currentPlayers: 0,
        createdBy: user.fullName,
        createdAt: new Date().toISOString(),
        status: 'waiting',
      };

      setCreatedRoom(newRoom);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyCode = () => {
    if (createdRoom) {
      navigator.clipboard.writeText(createdRoom.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin/dashboard">
            <Button
              variant="ghost"
              className="text-foreground hover:bg-background"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Create Game Room</h1>
          <div className="w-32" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {createdRoom ? (
          // Room Created Success State
          <Card className="bg-card border-border shadow-lg">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-3xl text-foreground">
                Game Room Created
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Share the room code with players to join
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Room Code Display */}
              <div className="bg-background rounded-lg p-8 text-center border-2 border-dashed border-border">
                <p className="text-sm text-muted-foreground mb-3">Room Code</p>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <p className="text-5xl font-bold text-primary font-mono">
                    {createdRoom.code}
                  </p>
                  <Button
                    onClick={handleCopyCode}
                    variant="outline"
                    className="border-border text-foreground hover:bg-card"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-4 h-4 mr-2 text-primary" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Players can use this code to join the game
                </p>
              </div>

              {/* Room Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-background rounded-lg p-4 border border-border">
                  <p className="text-xs text-muted-foreground uppercase mb-2">
                    Difficulty
                  </p>
                  <p className="text-lg font-semibold text-foreground capitalize">
                    {createdRoom.difficulty}
                  </p>
                </div>
                <div className="bg-background rounded-lg p-4 border border-border">
                  <p className="text-xs text-muted-foreground uppercase mb-2">
                    Max Players
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {createdRoom.maxPlayers}
                  </p>
                </div>
                <div className="bg-background rounded-lg p-4 border border-border">
                  <p className="text-xs text-muted-foreground uppercase mb-2">
                    Current Players
                  </p>
                  <p className="text-lg font-semibold text-accent">
                    {createdRoom.currentPlayers}/{createdRoom.maxPlayers}
                  </p>
                </div>
                <div className="bg-background rounded-lg p-4 border border-border">
                  <p className="text-xs text-muted-foreground uppercase mb-2">
                    Status
                  </p>
                  <p className="text-lg font-semibold text-primary capitalize">
                    {createdRoom.status}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setCreatedRoom(null)}
                  variant="outline"
                  className="flex-1 border-border text-foreground hover:bg-card"
                >
                  Create Another Room
                </Button>
                <Link href="/admin/dashboard" className="flex-1">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Back to Admin Panel
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Room Configuration Form
          <Card className="bg-card border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-foreground">
                Configure New Game Room
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Set up the parameters for a new multiplayer game session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Difficulty Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['easy', 'medium', 'hard'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${
                          difficulty === level
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-background hover:border-primary/50'
                        }`}
                        disabled={isCreating}
                      >
                        <p className="font-semibold text-foreground capitalize">
                          {level}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {level === 'easy' && 'Single digit'}
                          {level === 'medium' && 'Double digit'}
                          {level === 'hard' && 'Triple digit'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Players */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Maximum Players
                  </label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      min="2"
                      max="36"
                      value={maxPlayers}
                      onChange={(e) =>
                        setMaxPlayers(
                          Math.max(2, Math.min(36, parseInt(e.target.value) || 10))
                        )
                      }
                      className="bg-input border-border text-foreground"
                      disabled={isCreating}
                    />
                    <span className="text-sm text-muted-foreground">
                      (2-36 players)
                    </span>
                  </div>
                </div>

                {/* Info Box */}
                <Card className="bg-background border-border">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      Once created, players can join using the unique room code. 
                      The game will start when you begin it from the admin dashboard.
                    </p>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Link href="/admin/dashboard" className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full border-border text-foreground hover:bg-card"
                      disabled={isCreating}
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    onClick={handleCreateRoom}
                    disabled={isCreating}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isCreating ? 'Creating...' : 'Create Room'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

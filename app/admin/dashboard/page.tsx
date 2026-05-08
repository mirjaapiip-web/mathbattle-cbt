'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/session-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Users, Plus, Settings, BarChart3 } from 'lucide-react';
import Link from 'next/link';

// Mark this page as dynamic to prevent prerendering issues
export const dynamic = 'force-dynamic';

interface PlayerSession {
  id: string;
  fullName: string;
  class: string;
  absenNumber: string;
  score: number;
  joinedAt: string;
  status: 'active' | 'completed' | 'idle';
}

export default function AdminDashboardPage() {
  const { user, loading, clearUser, isAdmin } = useSession();
  const router = useRouter();
  const [playerSessions, setPlayerSessions] = useState<PlayerSession[]>([]);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/entry');
    }
  }, [user, loading, isAdmin, router]);

  const handleLogout = () => {
    clearUser();
    router.push('/entry');
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-foreground font-medium">{user.fullName}</p>
              <p className="text-sm text-muted-foreground">Administrator</p>
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
            Admin Dashboard
          </h2>
          <p className="text-muted-foreground">
            Manage games, questions, and monitor player activity
          </p>
        </div>

        {/* Admin Actions Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Create Room */}
          <Card className="bg-card border-border hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Plus className="w-6 h-6 text-primary" />
                <CardTitle className="text-foreground">Create Game Room</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                Start a new multiplayer game session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/create-room">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Create Room
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Manage Questions */}
          <Card className="bg-card border-border hover:border-accent transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Settings className="w-6 h-6 text-accent" />
                <CardTitle className="text-foreground">Manage Questions</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                Add, edit, and organize math questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/questions">
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  Manage Questions
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* View Analytics */}
          <Card className="bg-card border-border hover:border-secondary transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-6 h-6 text-secondary" />
                <CardTitle className="text-foreground">Analytics</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                View game statistics and player performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/analytics">
                <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Player Monitoring Section */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-foreground">Connected Players</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Real-time player activity and performance
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {playerSessions.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No active player sessions</p>
                <p className="text-sm text-muted-foreground">
                  Players will appear here when they join games
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                        Full Name
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                        Class
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                        Attendance #
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                        Score
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                        Status
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerSessions.map((player) => (
                      <tr
                        key={player.id}
                        className="border-b border-border hover:bg-background/50 transition-colors"
                      >
                        <td className="py-4 px-4 text-foreground font-medium">
                          {player.fullName}
                        </td>
                        <td className="py-4 px-4 text-foreground">
                          {player.class}
                        </td>
                        <td className="py-4 px-4 text-center text-foreground">
                          {player.absenNumber}
                        </td>
                        <td className="py-4 px-4 text-center text-primary font-bold">
                          {player.score}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            player.status === 'active'
                              ? 'bg-accent/20 text-accent'
                              : player.status === 'completed'
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted/20 text-muted-foreground'
                          }`}>
                            {player.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center text-sm text-muted-foreground">
                          {new Date(player.joinedAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mt-8">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary mb-2">{playerSessions.length}</p>
                <p className="text-sm text-muted-foreground">Active Players</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-accent mb-2">0</p>
                <p className="text-sm text-muted-foreground">Games in Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-secondary mb-2">0</p>
                <p className="text-sm text-muted-foreground">Total Questions</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-foreground mb-2">0</p>
                <p className="text-sm text-muted-foreground">Games Completed</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

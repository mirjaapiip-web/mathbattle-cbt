'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trophy, Users, Zap, Clock, Copy, Check } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Participant {
  id: string;
  fullName: string;
  class: string;
  status: 'waiting' | 'in_progress' | 'submitted';
  currentQuestion?: number;
  score?: number;
  timeSpent?: number;
}

interface CompetitionRoom {
  id: string;
  code: string;
  title: string;
  examTitle: string;
  status: 'waiting' | 'in_progress' | 'finished';
  maxParticipants: number;
  currentParticipants: Participant[];
  startTime?: string;
  endTime?: string;
}

export default function CompetitionRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const [room, setRoom] = useState<CompetitionRoom | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('user_token');
    if (!token) {
      router.push('/user-login');
      return;
    }

    // Mock room data
    const mockRoom: CompetitionRoom = {
      id: roomId,
      code: 'MATH2024',
      title: 'Mathematics Battle Royal',
      examTitle: 'Mathematics Final Exam',
      status: 'waiting',
      maxParticipants: 36,
      currentParticipants: [
        {
          id: '1',
          fullName: 'Ahmad Rizki',
          class: '10A',
          status: 'waiting',
        },
        {
          id: '2',
          fullName: 'Siti Nurhaliza',
          class: '10A',
          status: 'waiting',
        },
        {
          id: '3',
          fullName: 'Budi Santoso',
          class: '10B',
          status: 'waiting',
        },
      ],
    };

    setRoom(mockRoom);
    setLoading(false);
  }, [roomId, router]);

  const copyRoomCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading competition room...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Room not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Trophy className="w-8 h-8 text-accent" />
                {room.title}
              </h1>
              <p className="text-muted-foreground">{room.examTitle}</p>
            </div>
            <div
              className={`px-4 py-2 rounded-lg font-semibold ${
                room.status === 'waiting'
                  ? 'bg-amber-500/20 text-amber-600'
                  : room.status === 'in_progress'
                  ? 'bg-primary/20 text-primary'
                  : 'bg-green-500/20 text-green-600'
              }`}
            >
              {room.status === 'waiting'
                ? 'Waiting to Start'
                : room.status === 'in_progress'
                ? 'In Progress'
                : 'Finished'}
            </div>
          </div>

          {/* Room Code */}
          <div className="flex items-center gap-2 bg-background border border-border rounded-lg p-3 w-fit">
            <span className="text-muted-foreground text-sm">Room Code:</span>
            <code className="text-lg font-bold text-foreground">{room.code}</code>
            <Button
              onClick={copyRoomCode}
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              label: 'Participants',
              value: `${room.currentParticipants.length}/${room.maxParticipants}`,
              icon: Users,
            },
            {
              label: 'Status',
              value: room.status.charAt(0).toUpperCase() + room.status.slice(1),
              icon: Zap,
            },
            {
              label: 'Prize',
              value: '🏆 Certificate',
              icon: Trophy,
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-muted-foreground">
                      {stat.label}
                    </CardDescription>
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Leaderboard */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Live Leaderboard</CardTitle>
            <CardDescription className="text-muted-foreground">
              Real-time participant standings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {room.currentParticipants.map((participant, idx) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                        idx === 0
                          ? 'bg-yellow-500/20 text-yellow-600'
                          : idx === 1
                          ? 'bg-slate-400/20 text-slate-600'
                          : idx === 2
                          ? 'bg-orange-500/20 text-orange-600'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {participant.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">{participant.class}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          participant.status === 'submitted'
                            ? 'bg-green-500/20 text-green-600'
                            : participant.status === 'in_progress'
                            ? 'bg-primary/20 text-primary'
                            : 'bg-amber-500/20 text-amber-600'
                        }`}
                      >
                        {participant.status === 'in_progress'
                          ? 'In Progress'
                          : participant.status === 'submitted'
                          ? 'Submitted'
                          : 'Waiting'}
                      </span>
                    </div>
                    {participant.score !== undefined && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Score</p>
                        <p className="text-lg font-bold text-foreground">
                          {participant.score}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {room.status === 'waiting' && (
            <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Clock className="w-4 h-4" />
              Waiting for Room to Start...
            </Button>
          )}
          {room.status === 'in_progress' && (
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => router.push(`/user-exams/${room.code}`)}
            >
              Continue Exam
            </Button>
          )}
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-background"
            onClick={() => router.push('/user-dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
}

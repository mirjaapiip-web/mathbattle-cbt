'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Plus, Copy, Check, MoreVertical } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface CompetitionRoom {
  id: string;
  code: string;
  title: string;
  participants: number;
  maxParticipants: number;
  status: 'waiting' | 'in_progress' | 'finished';
  createdAt: string;
}

export default function AdminCompetitionPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<CompetitionRoom[]>([
    {
      id: '1',
      code: 'MATH2024',
      title: 'Mathematics Battle Royal',
      participants: 24,
      maxParticipants: 36,
      status: 'in_progress',
      createdAt: new Date(Date.now() - 30 * 60000).toLocaleString(),
    },
    {
      id: '2',
      code: 'PHYS2024',
      title: 'Physics Competition',
      participants: 18,
      maxParticipants: 36,
      status: 'waiting',
      createdAt: new Date().toLocaleString(),
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [newRoom, setNewRoom] = useState({
    title: '',
    examId: '',
    maxParticipants: 36,
  });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCreateRoom = async () => {
    if (!newRoom.title || !newRoom.examId) {
      alert('Please fill all fields');
      return;
    }

    try {
      const response = await fetch('/api/competition/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: localStorage.getItem('admin_data') ? JSON.parse(localStorage.getItem('admin_data')!).id : '',
          examId: newRoom.examId,
          title: newRoom.title,
          maxParticipants: newRoom.maxParticipants,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to create room');
        return;
      }

      // Add new room to list
      const room: CompetitionRoom = {
        id: data.data.id,
        code: data.roomCode,
        title: newRoom.title,
        participants: 0,
        maxParticipants: newRoom.maxParticipants,
        status: 'waiting',
        createdAt: new Date().toLocaleString(),
      };

      setRooms([...rooms, room]);
      setShowModal(false);
      setNewRoom({ title: '', examId: '', maxParticipants: 36 });
      alert(`Competition room created! Code: ${data.roomCode}`);
    } catch (error) {
      console.error('Create room error:', error);
      alert('Failed to create room');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-2 mb-2">
            <Trophy className="w-8 h-8 text-accent" />
            Competition Rooms
          </h2>
          <p className="text-muted-foreground">Create and manage multiplayer competitions</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Competition
        </Button>
      </div>

      {/* Room Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-card border-border max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle className="text-foreground">Create Competition Room</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Room Title</label>
                <Input
                  placeholder="e.g., Mathematics Battle Royal"
                  value={newRoom.title}
                  onChange={(e) => setNewRoom({ ...newRoom, title: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Select Exam</label>
                <select
                  value={newRoom.examId}
                  onChange={(e) => setNewRoom({ ...newRoom, examId: e.target.value })}
                  className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground"
                >
                  <option value="">Choose an exam...</option>
                  <option value="1">Mathematics Final Exam</option>
                  <option value="2">Physics Midterm</option>
                  <option value="3">English Placement</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Max Participants</label>
                <Input
                  type="number"
                  min="2"
                  max="100"
                  value={newRoom.maxParticipants}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, maxParticipants: parseInt(e.target.value) })
                  }
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setShowModal(false)}
                  variant="outline"
                  className="flex-1 border-border text-foreground hover:bg-background"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRoom}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Create
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rooms Grid */}
      <div className="grid gap-4">
        {rooms.map((room) => (
          <Card key={room.id} className="bg-card border-border hover:border-primary transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-foreground">{room.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Code: {room.code}
                  </CardDescription>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    room.status === 'waiting'
                      ? 'bg-amber-500/20 text-amber-600'
                      : room.status === 'in_progress'
                      ? 'bg-primary/20 text-primary'
                      : 'bg-green-500/20 text-green-600'
                  }`}
                >
                  {room.status === 'waiting'
                    ? 'Waiting'
                    : room.status === 'in_progress'
                    ? 'In Progress'
                    : 'Finished'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {room.participants}/{room.maxParticipants} participants
                  </p>
                  <p className="text-xs text-muted-foreground">{room.createdAt}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => copyCode(room.code)}
                    size="sm"
                    variant="outline"
                    className="border-border text-foreground hover:bg-background gap-1"
                  >
                    {copiedCode === room.code ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Code
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border text-foreground hover:bg-background"
                    onClick={() => router.push(`/admin/competition/${room.id}`)}
                  >
                    Manage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rooms.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="pt-8 pb-8 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No competition rooms yet.</p>
            <Button
              onClick={() => setShowModal(true)}
              className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Create your first competition
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

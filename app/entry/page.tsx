'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, type UserRole } from '@/lib/session-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Lock, Users } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Mark this page as dynamic to prevent prerendering issues
export const dynamic = 'force-dynamic';

export default function EntryPage() {
  const router = useRouter();
  const { user: existingUser, setUser } = useSession();
  const [role, setRole] = useState<UserRole | null>(null);
  const [fullName, setFullName] = useState('');
  const [className, setClassName] = useState('');
  const [absenNumber, setAbsenNumber] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If user already has a session, redirect appropriately
  if (existingUser) {
    if (existingUser.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/dashboard');
    }
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!role) {
      setError('Please select a role');
      return;
    }

    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }

    if (!className.trim()) {
      setError('Class is required');
      return;
    }

    if (fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters');
      return;
    }

    if (role === 'admin' && !adminPassword) {
      setError('Admin password is required');
      return;
    }

    // Admin password validation (hardcoded for MVP - in production use proper auth)
    if (role === 'admin' && adminPassword !== 'admin123') {
      setError('Invalid admin password');
      return;
    }

    if (role === 'player' && !absenNumber.trim()) {
      setError('Attendance number is required');
      return;
    }

    try {
      setIsLoading(true);
      const userId = uuidv4();

      const sessionUser = {
        id: userId,
        fullName: fullName.trim(),
        class: className.trim(),
        ...(role === 'player' && { absenNumber: absenNumber.trim() }),
        role,
      };

      setUser(sessionUser);

      // Redirect based on role
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Failed to create session. Please try again.');
      console.error('Session creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary rounded-lg">
                <Zap className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Math Battle Arena
            </h1>
            <p className="text-muted-foreground">
              Select your role to continue
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Player Role Card */}
            <Card
              onClick={() => setRole('player')}
              className="bg-card border-border cursor-pointer hover:border-primary transition-all duration-300 transform hover:scale-105"
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Users className="w-12 h-12 text-accent" />
                </div>
                <CardTitle className="text-foreground">Player</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Join a battle and compete
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                    Compete in matches
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                    Climb leaderboards
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                    Track your progress
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Admin Role Card */}
            <Card
              onClick={() => setRole('admin')}
              className="bg-card border-border cursor-pointer hover:border-primary transition-all duration-300 transform hover:scale-105"
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Lock className="w-12 h-12 text-primary" />
                </div>
                <CardTitle className="text-foreground">Admin</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage games and questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Create game rooms
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Manage questions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Monitor players
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md bg-card border-border shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-lg ${role === 'admin' ? 'bg-primary' : 'bg-accent'}`}>
              {role === 'admin' ? (
                <Lock className="w-6 h-6 text-primary-foreground" />
              ) : (
                <Users className="w-6 h-6 text-accent-foreground" />
              )}
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">
            {role === 'admin' ? 'Admin Login' : 'Player Entry'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {role === 'admin' 
              ? 'Enter your credentials to access admin features'
              : 'Enter your details to start playing'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/20 text-destructive rounded-md text-sm animate-in">
                {error}
              </div>
            )}

            {role === 'admin' ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Admin name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Class/School
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., School A, Grade 10"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Admin Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter admin password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
                    disabled={isLoading}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Class
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., 10A, Grade 5, Period 2"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Attendance Number (Absen)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., 5, 12, A1"
                    value={absenNumber}
                    onChange={(e) => setAbsenNumber(e.target.value)}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full ${role === 'admin' ? 'bg-primary hover:bg-primary/90' : 'bg-accent hover:bg-accent/90'} text-primary-foreground font-semibold transition-all duration-200`}
            >
              {isLoading ? 'Starting...' : role === 'admin' ? 'Enter Admin Panel' : 'Start Battle'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setRole(null)}
              className="w-full border-border text-foreground hover:bg-card"
              disabled={isLoading}
            >
              Back
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

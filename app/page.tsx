'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/session-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, Gamepad2, TrendingUp, Users } from 'lucide-react';

export default function Home() {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/entry');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Zap className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
}

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserProfile } from '@/lib/api';

export async function GET(request: NextRequest) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  // Get user profile with stats
  const profile = await getUserProfile(user.id);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      profile: profile || null,
    },
  });
}

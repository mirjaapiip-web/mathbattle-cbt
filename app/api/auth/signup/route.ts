import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createUserProfile } from '@/lib/api';

export async function POST(request: NextRequest) {
  const { email, password, username } = await request.json();

  if (!email || !password || !username) {
    return NextResponse.json(
      { error: 'Email, password, and username are required' },
      { status: 400 }
    );
  }

  // Sign up with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  if (data.user) {
    // Create user profile
    try {
      await createUserProfile(data.user.id, username);
    } catch (profileError) {
      console.error('Failed to create user profile:', profileError);
      // Continue even if profile creation fails, user is still created
    }
  }

  return NextResponse.json({ 
    message: 'Sign up successful',
    user: data.user 
  }, { status: 201 });
}

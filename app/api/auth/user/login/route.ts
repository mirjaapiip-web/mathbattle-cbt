import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan kata sandi wajib diisi' }, { status: 400 });
    }

    const supabase = createServerClient();
    
    // Call userLogin from auth.ts
    const { userLogin } = await import('@/lib/auth');
    const result = await userLogin(email, password);

    if (!result.success) {
      return NextResponse.json({ error: 'Kredensial tidak valid' }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      data: result.data,
      token: result.token,
    });

    response.cookies.set({
      name: 'user_token',
      value: result.token!,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Gagal masuk' }, { status: 500 });
  }
}

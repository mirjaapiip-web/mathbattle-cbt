import { NextRequest, NextResponse } from 'next/server';
import { adminRegister, createAdminSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, schoolName } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, kata sandi, dan nama lengkap wajib diisi' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Kata sandi minimal 8 karakter' },
        { status: 400 }
      );
    }

    const result = await adminRegister(email, password, fullName, schoolName);

    if (!result.success) {
      const errMsg = (result.error as any)?.code === '23505'
        ? 'Email sudah terdaftar'
        : 'Pendaftaran gagal';
      return NextResponse.json({ error: errMsg }, { status: 400 });
    }

    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    await createAdminSession(result.data.id, result.token!, ipAddress, userAgent);

    const response = NextResponse.json({
      success: true,
      data: result.data,
      token: result.token,
    });

    response.cookies.set({
      name: 'admin_token',
      value: result.token!,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('[MathBattle] Admin register error:', error);
    return NextResponse.json({ error: 'Pendaftaran gagal' }, { status: 500 });
  }
}

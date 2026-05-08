import { NextRequest, NextResponse } from 'next/server';
import { userRegister, createUserSession } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, className, attendanceNumber, adminCode } = await request.json();

    if (!email || !password || !fullName || !className || !attendanceNumber) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Kata sandi minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Resolve admin_id from adminCode (admin's email prefix or ID)
    let adminId: string | undefined;
    if (adminCode) {
      const supabase = createServerClient();
      // adminCode bisa berupa email admin atau ID admin
      const { data: adminData } = await supabase
        .from('admins')
        .select('id')
        .or(`email.eq.${adminCode},id.eq.${adminCode}`)
        .single();
      if (adminData) {
        adminId = adminData.id;
      }
    }

    const result = await userRegister(email, password, fullName, className, attendanceNumber, adminId);

    if (!result.success) {
      const errMsg = (result.error as any)?.code === '23505'
        ? 'Email sudah terdaftar'
        : 'Pendaftaran gagal';
      return NextResponse.json({ error: errMsg }, { status: 400 });
    }

    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    await createUserSession(result.data.id, result.token, ipAddress, userAgent);

    const response = NextResponse.json({
      success: true,
      data: result.data,
      token: result.token,
    });

    response.cookies.set({
      name: 'user_token',
      value: result.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('[MathBattle] User registration error:', error);
    return NextResponse.json({ error: 'Pendaftaran gagal' }, { status: 500 });
  }
}

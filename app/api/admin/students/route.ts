import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

function getAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const d = verifyToken(token);
  return d?.role === 'admin' ? d : null;
}

export async function GET(req: NextRequest) {
  const admin = getAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Tidak terotorisasi' }, { status: 401 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, class, attendance_number, last_login, created_at')
    .eq('admin_id', admin.id)
    .order('class')
    .order('attendance_number');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data || [] });
}

export async function DELETE(req: NextRequest) {
  const admin = getAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Tidak terotorisasi' }, { status: 401 });

  const { id } = await req.json();
  const supabase = createServerClient();
  const { error } = await supabase
    .from('users').delete().eq('id', id).eq('admin_id', admin.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

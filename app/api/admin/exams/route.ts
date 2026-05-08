import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

function getAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const d = verifyToken(token);
  return d?.role === 'admin' ? d : null;
}

// GET all exams for admin
export async function GET(req: NextRequest) {
  const admin = getAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Tidak terotorisasi' }, { status: 401 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('exams')
    .select('*, questions(count)')
    .eq('admin_id', admin.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST create exam
export async function POST(req: NextRequest) {
  const admin = getAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Tidak terotorisasi' }, { status: 401 });

  const body = await req.json();
  const { title, description, subject, duration_minutes, passing_score, status, shuffle_questions, shuffle_options, allowed_classes, start_time, end_time } = body;

  if (!title) return NextResponse.json({ error: 'Judul ujian wajib diisi' }, { status: 400 });

  const supabase = createServerClient();
  const { data, error } = await supabase.from('exams').insert({
    admin_id: admin.id,
    title,
    description,
    subject: subject || 'Matematika',
    duration_minutes: duration_minutes || 60,
    passing_score: passing_score || 70,
    status: status || 'draft',
    shuffle_questions: shuffle_questions || false,
    shuffle_options: shuffle_options || false,
    allowed_classes: allowed_classes || [],
    start_time: start_time || null,
    end_time: end_time || null,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// PATCH update exam
export async function PATCH(req: NextRequest) {
  const admin = getAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Tidak terotorisasi' }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'ID ujian wajib diisi' }, { status: 400 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('exams')
    .update(updates)
    .eq('id', id)
    .eq('admin_id', admin.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// DELETE exam
export async function DELETE(req: NextRequest) {
  const admin = getAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Tidak terotorisasi' }, { status: 401 });

  const { id } = await req.json();
  const supabase = createServerClient();
  const { error } = await supabase.from('exams').delete().eq('id', id).eq('admin_id', admin.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

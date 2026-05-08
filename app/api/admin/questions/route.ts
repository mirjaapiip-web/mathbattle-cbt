import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

function getAdminFromRequest(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth) return null;
  const token = auth.replace('Bearer ', '');
  return verifyToken(token);
}

// GET: list questions for admin
export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin || admin.role !== 'admin') return NextResponse.json({ error: 'Tidak terotorisasi' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const examId = searchParams.get('examId');

  const supabase = createServerClient();
  let query = supabase.from('questions').select('*').eq('admin_id', admin.id).order('created_at', { ascending: false });
  if (examId) query = query.eq('exam_id', examId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST: create question
export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin || admin.role !== 'admin') return NextResponse.json({ error: 'Tidak terotorisasi' }, { status: 401 });

  const body = await req.json();
  const { question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, topic, exam_id, points } = body;

  if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_answer) {
    return NextResponse.json({ error: 'Field wajib tidak lengkap' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase.from('questions').insert({
    admin_id: admin.id,
    exam_id: exam_id || null,
    question_text, option_a, option_b, option_c, option_d,
    correct_answer, explanation, difficulty: difficulty || 'sedang',
    topic, points: points || 1, source: 'manual',
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update total_questions count on exam
  if (exam_id) {
    const { count } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('exam_id', exam_id);
    await supabase.from('exams').update({ total_questions: count || 0 }).eq('id', exam_id);
  }

  return NextResponse.json({ data });
}

// DELETE: delete question
export async function DELETE(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin || admin.role !== 'admin') return NextResponse.json({ error: 'Tidak terotorisasi' }, { status: 401 });

  const { id } = await req.json();
  const supabase = createServerClient();
  const { error } = await supabase.from('questions').delete().eq('id', id).eq('admin_id', admin.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

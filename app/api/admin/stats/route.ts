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

  // Get total students registered under this admin
  const { count: totalStudents } = await supabase
    .from('users').select('*', { count: 'exact', head: true }).eq('admin_id', admin.id);

  // Get total exams
  const { count: totalExams } = await supabase
    .from('exams').select('*', { count: 'exact', head: true }).eq('admin_id', admin.id);

  // Get active exams
  const { count: activeExams } = await supabase
    .from('exams').select('*', { count: 'exact', head: true })
    .eq('admin_id', admin.id).eq('status', 'active');

  // Get total questions
  const { count: totalQuestions } = await supabase
    .from('questions').select('*', { count: 'exact', head: true }).eq('admin_id', admin.id);

  // Get today's attempts
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: todayAttempts } = await supabase
    .from('exam_attempts')
    .select('*, exams!inner(admin_id)', { count: 'exact', head: true })
    .eq('exams.admin_id', admin.id)
    .gte('started_at', today.toISOString());

  // Get average score
  const { data: scoreData } = await supabase
    .from('exam_attempts')
    .select('score, exams!inner(admin_id)')
    .eq('exams.admin_id', admin.id)
    .eq('status', 'submitted')
    .not('score', 'is', null);

  const avgScore = scoreData && scoreData.length > 0
    ? Math.round(scoreData.reduce((sum, a) => sum + (a.score || 0), 0) / scoreData.length)
    : 0;

  // Get recent attempts with student info
  const { data: recentAttempts } = await supabase
    .from('exam_attempts')
    .select(`
      id, status, score, started_at, submitted_at, violation_count,
      users(full_name, class, attendance_number),
      exams!inner(title, admin_id)
    `)
    .eq('exams.admin_id', admin.id)
    .order('started_at', { ascending: false })
    .limit(20);

  return NextResponse.json({
    stats: {
      totalStudents: totalStudents || 0,
      totalExams: totalExams || 0,
      activeExams: activeExams || 0,
      totalQuestions: totalQuestions || 0,
      todayAttempts: todayAttempts || 0,
      avgScore,
    },
    recentAttempts: recentAttempts || [],
  });
}

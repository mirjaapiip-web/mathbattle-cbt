import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

function getAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const d = verifyToken(token);
  return d?.role === 'admin' ? d : null;
}

interface AIQuestion {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: 'mudah' | 'sedang' | 'sulit';
  topic: string;
}

async function generateWithGoogleAI(topic: string, difficulty: string, count: number, subject: string): Promise<AIQuestion[]> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error('Google AI API key tidak tersedia');

  const difficultyMap: Record<string, string> = {
    mudah: 'mudah (untuk siswa SD atau SMP)',
    sedang: 'sedang (untuk siswa SMA)',
    sulit: 'sulit (untuk siswa SMA atau mahasiswa)',
  };

  const prompt = `Kamu adalah guru ${subject} berpengalaman di Indonesia. Buatkan ${count} soal pilihan ganda tentang topik "${topic}" dengan tingkat kesulitan ${difficultyMap[difficulty] || difficulty}.

Format respons HARUS berupa JSON array yang valid, tanpa teks lain:
[
  {
    "question_text": "Pertanyaan soal di sini?",
    "option_a": "Pilihan A",
    "option_b": "Pilihan B", 
    "option_c": "Pilihan C",
    "option_d": "Pilihan D",
    "correct_answer": "A",
    "explanation": "Penjelasan mengapa jawabannya benar",
    "difficulty": "${difficulty}",
    "topic": "${topic}"
  }
]

Pastikan:
- Semua soal dalam Bahasa Indonesia
- Setiap soal memiliki tepat 4 pilihan (A, B, C, D)
- Jawaban benar bervariasi (tidak selalu A)
- Penjelasan singkat dan jelas
- Soal sesuai kurikulum Indonesia`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Google AI error: ${err}`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Extract JSON from response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Format respons AI tidak valid');

  const questions: AIQuestion[] = JSON.parse(jsonMatch[0]);
  return questions;
}

export async function POST(req: NextRequest) {
  const admin = getAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Tidak terotorisasi' }, { status: 401 });

  const body = await req.json();
  const { topic, difficulty, count, subject, exam_id, save_to_db } = body;

  if (!topic || !difficulty || !count) {
    return NextResponse.json({ error: 'Topik, tingkat kesulitan, dan jumlah soal wajib diisi' }, { status: 400 });
  }

  const numCount = Math.min(Math.max(parseInt(count), 1), 20);

  try {
    const questions = await generateWithGoogleAI(topic, difficulty, numCount, subject || 'Matematika');

    if (save_to_db && questions.length > 0) {
      const supabase = createServerClient();
      const rows = questions.map(q => ({
        ...q,
        admin_id: admin.id,
        exam_id: exam_id || null,
        source: 'ai_generated' as const,
        points: 1,
        is_active: true,
      }));

      const { data: saved, error } = await supabase.from('questions').insert(rows).select();
      if (error) {
        return NextResponse.json({
          questions,
          warning: `Gagal menyimpan ke database: ${error.message}`,
          savedCount: 0,
        });
      }

      // Update question count on exam
      if (exam_id) {
        const { count: qCount } = await supabase
          .from('questions').select('*', { count: 'exact', head: true }).eq('exam_id', exam_id);
        await supabase.from('exams').update({ total_questions: qCount || 0 }).eq('id', exam_id);
      }

      return NextResponse.json({ questions: saved, savedCount: saved?.length || 0 });
    }

    return NextResponse.json({ questions, savedCount: 0 });
  } catch (error: any) {
    console.error('[MathBattle] AI generate error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal menghasilkan soal. Periksa API key.' },
      { status: 500 }
    );
  }
}

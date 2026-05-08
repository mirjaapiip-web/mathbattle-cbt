import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const { adminId, examId, title, maxParticipants = 36 } = await request.json();

    if (!adminId || !examId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const roomCode = generateRoomCode();

    const { data, error } = await supabase
      .from('competition_rooms')
      .insert({
        admin_id: adminId,
        exam_id: examId,
        room_code: roomCode,
        title: title || 'Competition Battle',
        max_participants: maxParticipants,
        status: 'waiting',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      roomCode,
    });
  } catch (error) {
    console.error('[v0] Room creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}

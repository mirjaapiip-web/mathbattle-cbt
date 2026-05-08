import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { roomId, userId } = await request.json();

    if (!roomId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Add participant to room
    const { data, error } = await supabase
      .from('competition_participants')
      .insert({
        room_id: roomId,
        user_id: userId,
        join_time: new Date(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Already joined this room' },
          { status: 400 }
        );
      }
      throw error;
    }

    // Update participant count
    await supabase.rpc('increment_room_participants', { p_room_id: roomId });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('[v0] Join room error:', error);
    return NextResponse.json(
      { error: 'Failed to join room' },
      { status: 500 }
    );
  }
}

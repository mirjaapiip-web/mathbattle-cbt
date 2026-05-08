import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const roomId = params.id;

    const supabase = createServerClient();

    // Get room details
    const { data: room, error: roomError } = await supabase
      .from('competition_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomError) throw roomError;

    // Get participants
    const { data: participants, error: participantsError } = await supabase
      .from('competition_participants')
      .select(
        `
        id,
        user_id,
        join_time,
        finish_time,
        final_score,
        rank,
        users:user_id (full_name, class)
      `
      )
      .eq('room_id', roomId)
      .order('rank', { ascending: true });

    if (participantsError) throw participantsError;

    return NextResponse.json({
      success: true,
      room,
      participants: participants || [],
    });
  } catch (error) {
    console.error('[v0] Get room error:', error);
    return NextResponse.json(
      { error: 'Failed to get room details' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const roomId = params.id;
    const { status } = await request.json();

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('competition_rooms')
      .update({
        status,
        start_time: status === 'in_progress' ? new Date() : undefined,
        end_time: status === 'finished' ? new Date() : undefined,
      })
      .eq('id', roomId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('[v0] Update room error:', error);
    return NextResponse.json(
      { error: 'Failed to update room' },
      { status: 500 }
    );
  }
}

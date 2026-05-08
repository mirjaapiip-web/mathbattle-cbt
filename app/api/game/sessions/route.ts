import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Create a new game session
export async function POST(request: NextRequest) {
  const { mode, difficulty, roomId, maxPlayers } = await request.json();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const { data, error } = await supabase
      .from('game_sessions')
      .insert({
        mode,
        difficulty,
        room_id: roomId || null,
        max_players: maxPlayers || 1,
        current_players: 1,
        status: 'waiting',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create game session' },
      { status: 500 }
    );
  }
}

// Get game session details
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID required' },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game session' },
      { status: 500 }
    );
  }
}

// Update game session (start, finish, etc.)
export async function PUT(request: NextRequest) {
  const { sessionId, status, currentPlayers } = await request.json();

  try {
    const updateData: any = {};
    if (status) updateData.status = status;
    if (currentPlayers) updateData.current_players = currentPlayers;
    if (status === 'active') updateData.started_at = new Date().toISOString();
    if (status === 'finished') updateData.ended_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('game_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Failed to update game session' },
      { status: 500 }
    );
  }
}

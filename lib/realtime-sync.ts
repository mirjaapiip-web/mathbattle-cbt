import { createServerClient } from './supabase';

// ============ REAL-TIME EXAM UPDATES ============

export async function subscribeToExamProgress(
  examAttemptId: string,
  callback: (data: any) => void
) {
  try {
    const supabase = createServerClient();

    const subscription = supabase
      .channel(`exam_progress:${examAttemptId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'exam_attempts',
          filter: `id=eq.${examAttemptId}`,
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  } catch (error) {
    console.error('[v0] Subscription error:', error);
    return null;
  }
}

// ============ STUDENT MONITORING ============

export async function subscribeToStudentActivity(
  userId: string,
  callback: (data: any) => void
) {
  try {
    const supabase = createServerClient();

    const subscription = supabase
      .channel(`user_activity:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_activity_logs',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  } catch (error) {
    console.error('[v0] Activity subscription error:', error);
    return null;
  }
}

// ============ COMPETITION UPDATES ============

export async function subscribeToCompetitionLeaderboard(
  roomId: string,
  callback: (data: any) => void
) {
  try {
    const supabase = createServerClient();

    const subscription = supabase
      .channel(`competition_leaderboard:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'competition_participants',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  } catch (error) {
    console.error('[v0] Leaderboard subscription error:', error);
    return null;
  }
}

// ============ FOCUS VIOLATIONS ============

export async function subscribeToViolations(
  examAttemptId: string,
  callback: (data: any) => void
) {
  try {
    const supabase = createServerClient();

    const subscription = supabase
      .channel(`violations:${examAttemptId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'focus_violations',
          filter: `exam_attempt_id=eq.${examAttemptId}`,
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  } catch (error) {
    console.error('[v0] Violation subscription error:', error);
    return null;
  }
}

// ============ ROOM STATUS ============

export async function subscribeToRoomStatus(
  roomId: string,
  callback: (data: any) => void
) {
  try {
    const supabase = createServerClient();

    const subscription = supabase
      .channel(`room_status:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'competition_rooms',
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  } catch (error) {
    console.error('[v0] Room status subscription error:', error);
    return null;
  }
}

// ============ UNSUBSCRIBE ============

export async function unsubscribeFromChannel(subscription: any) {
  try {
    const supabase = createServerClient();
    await supabase.removeChannel(subscription);
    return { success: true };
  } catch (error) {
    console.error('[v0] Unsubscribe error:', error);
    return { success: false, error };
  }
}

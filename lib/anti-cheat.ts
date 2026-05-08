import { createServerClient } from './supabase';

export type ViolationType = 
  | 'tab_switch'
  | 'window_blur'
  | 'alt_tab'
  | 'minimize'
  | 'app_switch'
  | 'keyboard_shortcut';

// ============ VIOLATION TRACKING ============

export async function recordViolation(
  examAttemptId: string,
  userId: string,
  violationType: ViolationType,
  details?: string,
  screenshotUrl?: string
) {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('focus_violations')
      .insert({
        exam_attempt_id: examAttemptId,
        user_id: userId,
        violation_type: violationType,
        details,
        screenshot_url: screenshotUrl,
        violation_time: new Date(),
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('[v0] Violation recording error:', error);
    return { success: false, error };
  }
}

// ============ CHECK VIOLATIONS ============

export async function getViolationCount(examAttemptId: string): Promise<number> {
  try {
    const supabase = createServerClient();

    const { count, error } = await supabase
      .from('focus_violations')
      .select('*', { count: 'exact', head: true })
      .eq('exam_attempt_id', examAttemptId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('[v0] Get violation count error:', error);
    return 0;
  }
}

// ============ CHECK IF SHOULD AUTO-CLOSE ============

export async function shouldAutoCloseExam(
  examAttemptId: string,
  maxViolations: number
): Promise<boolean> {
  const count = await getViolationCount(examAttemptId);
  return count >= maxViolations;
}

// ============ AUTO-SUBMIT EXAM ============

export async function autoSubmitExam(examAttemptId: string, calculateScore: boolean = true) {
  try {
    const supabase = createServerClient();

    // Get exam attempt details
    const { data: attempt, error: fetchError } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('id', examAttemptId)
      .single();

    if (fetchError) throw fetchError;

    // Calculate score if needed
    let score = 0;
    if (calculateScore) {
      const { data: answers, error: answerError } = await supabase
        .from('exam_answers')
        .select('points_earned')
        .eq('exam_attempt_id', examAttemptId);

      if (answerError) throw answerError;
      score = answers?.reduce((sum, a) => sum + (a.points_earned || 0), 0) || 0;
    }

    // Update exam attempt
    const { data, error } = await supabase
      .from('exam_attempts')
      .update({
        status: 'auto_submitted',
        end_time: new Date(),
        submitted_at: new Date(),
        score,
      })
      .eq('id', examAttemptId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('[v0] Auto-submit error:', error);
    return { success: false, error };
  }
}

// ============ ACTIVITY LOGGING ============

export async function logActivity(
  userId: string,
  examAttemptId: string,
  activityType: string,
  details?: Record<string, any>
) {
  try {
    const supabase = createServerClient();

    await supabase.from('user_activity_logs').insert({
      user_id: userId,
      exam_attempt_id: examAttemptId,
      activity_type: activityType,
      details,
      created_at: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error('[v0] Activity logging error:', error);
    return { success: false, error };
  }
}

// ============ GET VIOLATION REPORT ============

export async function getViolationReport(examAttemptId: string) {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('focus_violations')
      .select('*')
      .eq('exam_attempt_id', examAttemptId)
      .order('violation_time', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('[v0] Get violation report error:', error);
    return { success: false, error };
  }
}

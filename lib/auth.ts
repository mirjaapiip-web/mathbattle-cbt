import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createServerClient } from './supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d';

// ============ PASSWORD HASHING ============

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============ TOKEN MANAGEMENT ============

export function generateToken(data: { id: string; email: string; role: 'admin' | 'user' }) {
  return jwt.sign(data, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
  } catch (error) {
    return null;
  }
}

// ============ ADMIN AUTHENTICATION ============

export async function adminRegister(email: string, password: string, fullName: string, schoolName?: string) {
  try {
    const supabase = createServerClient();
    const passwordHash = await hashPassword(password);

    const { data, error } = await supabase
      .from('admins')
      .insert({
        email,
        password_hash: passwordHash,
        full_name: fullName,
        school_name: schoolName,
      })
      .select('id, email, full_name')
      .single();

    if (error) throw error;

    const token = generateToken({
      id: data.id,
      email: data.email,
      role: 'admin',
    });

    return { success: true, data, token };
  } catch (error) {
    console.error('[v0] Admin registration error:', error);
    return { success: false, error };
  }
}

export async function adminLogin(email: string, password: string) {
  try {
    const supabase = createServerClient();

    const { data: admin, error: fetchError } = await supabase
      .from('admins')
      .select('id, email, password_hash, full_name, school_name')
      .eq('email', email)
      .single();

    if (fetchError || !admin) {
      return { success: false, error: 'Invalid credentials' };
    }

    const passwordMatch = await verifyPassword(password, admin.password_hash);
    if (!passwordMatch) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Update last_login
    await supabase
      .from('admins')
      .update({ updated_at: new Date() })
      .eq('id', admin.id);

    const token = generateToken({
      id: admin.id,
      email: admin.email,
      role: 'admin',
    });

    return {
      success: true,
      data: {
        id: admin.id,
        email: admin.email,
        fullName: admin.full_name,
        schoolName: admin.school_name,
      },
      token,
    };
  } catch (error) {
    console.error('[v0] Admin login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

// ============ USER AUTHENTICATION ============

export async function userRegister(
  email: string,
  password: string,
  fullName: string,
  className: string,
  attendanceNumber: string,
  adminId?: string
) {
  try {
    const supabase = createServerClient();
    const passwordHash = await hashPassword(password);

    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        full_name: fullName,
        class: className,
        attendance_number: attendanceNumber,
        admin_id: adminId,
      })
      .select('id, email, full_name, class, attendance_number')
      .single();

    if (error) throw error;

    const token = generateToken({
      id: data.id,
      email: data.email,
      role: 'user',
    });

    return { success: true, data, token };
  } catch (error) {
    console.error('[v0] User registration error:', error);
    return { success: false, error };
  }
}

export async function userLogin(email: string, password: string) {
  try {
    const supabase = createServerClient();

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, email, password_hash, full_name, class, attendance_number, admin_id')
      .eq('email', email)
      .single();

    if (fetchError || !user) {
      return { success: false, error: 'Invalid credentials' };
    }

    const passwordMatch = await verifyPassword(password, user.password_hash);
    if (!passwordMatch) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Update last_login
    await supabase
      .from('users')
      .update({ last_login: new Date() })
      .eq('id', user.id);

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: 'user',
    });

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        class: user.class,
        attendanceNumber: user.attendance_number,
        adminId: user.admin_id,
      },
      token,
    };
  } catch (error) {
    console.error('[v0] User login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

// ============ SESSION MANAGEMENT ============

export async function createAdminSession(adminId: string, token: string, ipAddress?: string, userAgent?: string) {
  try {
    const supabase = createServerClient();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await supabase.from('admin_sessions').insert({
      admin_id: adminId,
      token,
      ip_address: ipAddress,
      user_agent: userAgent,
      expires_at: expiresAt,
    });

    return { success: true };
  } catch (error) {
    console.error('[v0] Session creation error:', error);
    return { success: false, error };
  }
}

export async function createUserSession(userId: string, token: string, ipAddress?: string, userAgent?: string) {
  try {
    const supabase = createServerClient();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await supabase.from('user_sessions').insert({
      user_id: userId,
      token,
      ip_address: ipAddress,
      user_agent: userAgent,
      expires_at: expiresAt,
    });

    return { success: true };
  } catch (error) {
    console.error('[v0] Session creation error:', error);
    return { success: false, error };
  }
}

export async function invalidateSession(token: string, isAdmin: boolean = false) {
  try {
    const supabase = createServerClient();
    const table = isAdmin ? 'admin_sessions' : 'user_sessions';

    await supabase.from(table).delete().eq('token', token);

    return { success: true };
  } catch (error) {
    console.error('[v0] Session invalidation error:', error);
    return { success: false, error };
  }
}

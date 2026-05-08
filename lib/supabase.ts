import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side Supabase (anon key)
let clientInstance: ReturnType<typeof createClient> | null = null;

export const getSupabase = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[MathBattle] Kredensial Supabase tidak tersedia.');
    return createClient('https://dummy.supabase.co', 'dummy-key');
  }
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return clientInstance;
};

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_, prop) {
    return getSupabase()[prop as keyof ReturnType<typeof createClient>];
  },
});

// Server-side Supabase (service role key - bypass RLS)
let serverInstance: ReturnType<typeof createClient> | null = null;

export const createServerClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('[MathBattle] Service role key tidak tersedia. Menggunakan anon key.');
    return getSupabase();
  }
  if (!serverInstance) {
    serverInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return serverInstance;
};

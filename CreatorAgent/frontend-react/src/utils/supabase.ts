import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (
  import.meta.env.VITE_SUPABASE_URL || 'https://xepcqtvzehjnijdvjcfe.supabase.co'
).trim();

const SUPABASE_PUBLISHABLE_KEY = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_e77cpinfc4g9cV8s2vTQBw_BXDdlq38'
).trim();

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

/**
 * Authentication Helpers
 */
export async function signUpWithEmail(email: string, password: string, displayName?: string) {
  const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/app` : undefined;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName || email.split('@')[0],
      },
      emailRedirectTo: redirectUrl,
    },
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/app` : undefined;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

/**
 * Type-safe Database Table Helpers
 */
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateProfile(userId: string, updates: Record<string, any>) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, updated_at: new Date().toISOString(), ...updates })
    .select()
    .single();
  if (error) throw error;
  return data;
}

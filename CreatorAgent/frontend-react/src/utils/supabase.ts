import { createClient, type User, type Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserPreferences {
  user_id: string;
  editor_settings: {
    autoSave: boolean;
    snapTimeline: boolean;
    defaultRatio: string;
  };
  theme: string;
  quota_usage: {
    renders_this_month: number;
    storage_mb_used: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface AuditEventRecord {
  id: string;
  user_id: string;
  event_type: string;
  entity_type?: string;
  entity_id?: string;
  description: string;
  status: string;
  payload?: Record<string, any>;
  created_at: string;
}

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

export async function getCurrentSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

/**
 * Type-safe Database Table Helpers
 */

/**
 * Ensure a profile exists for the user without overwriting existing fields.
 */
export async function ensureProfile(user: User): Promise<UserProfile> {
  const existing = await getProfile(user.id);
  if (existing) {
    return existing;
  }

  const meta = user.user_metadata || {};
  const displayName =
    meta.full_name || meta.name || meta.display_name || user.email?.split('@')[0] || 'Creator';
  const avatarUrl = meta.avatar_url || meta.picture || '';
  const username = (user.email?.split('@')[0] || `creator_${user.id.slice(0, 5)}`)
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_');

  const newProfile: Partial<UserProfile> = {
    id: user.id,
    email: user.email || '',
    display_name: displayName,
    username,
    avatar_url: avatarUrl,
    bio: '',
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(newProfile)
    .select()
    .single();

  if (error) {
    console.warn('Could not auto-create profile:', error.message);
    return newProfile as UserProfile;
  }
  return data as UserProfile;
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data as UserProfile | null;
  } catch (err) {
    console.warn('getProfile error:', err);
    return null;
  }
}

export async function updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  const payload = {
    id: userId,
    updated_at: new Date().toISOString(),
    ...updates,
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload)
    .select()
    .single();

  if (error) throw error;

  // Dispatch global event so header/sidebar update immediately
  window.dispatchEvent(new CustomEvent('tubepilot:profile-updated', { detail: data }));
  return data as UserProfile;
}

/**
 * User Preferences
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data as UserPreferences | null;
  } catch {
    return null;
  }
}

export async function updateUserPreferences(
  userId: string,
  updates: Partial<UserPreferences>
): Promise<UserPreferences | null> {
  const payload = {
    user_id: userId,
    updated_at: new Date().toISOString(),
    ...updates,
  };

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as UserPreferences;
}

/**
 * YouTube Channels
 */
export async function getConnectedYouTubeChannel(userId: string) {
  try {
    const { data, error } = await supabase
      .from('youtube_channels')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch {
    return null;
  }
}

/**
 * User Activity / Audit Events
 */
export async function logAuditEvent(params: {
  userId: string;
  eventType: string;
  entityType?: string;
  entityId?: string;
  description: string;
  status?: string;
  payload?: Record<string, any>;
}): Promise<void> {
  try {
    await supabase.from('audit_events').insert({
      user_id: params.userId,
      event_type: params.eventType,
      entity_type: params.entityType || null,
      entity_id: params.entityId || null,
      description: params.description,
      status: params.status || 'success',
      payload: params.payload || {},
    });
  } catch (err) {
    console.debug('Audit log skipped/failed:', err);
  }
}

export async function getAuditEvents(userId: string, limit: number = 20): Promise<AuditEventRecord[]> {
  try {
    const { data, error } = await supabase
      .from('audit_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as AuditEventRecord[];
  } catch (err) {
    console.debug('Failed to fetch audit events:', err);
    return [];
  }
}

-- ==============================================================================
-- TubePilot AI - User Data Integrity, Profile Fields, YouTube Persistence & Audit Migration
-- Target Platform: Supabase PostgreSQL (xepcqtvzehjnijdvjcfe.supabase.co)
-- Migration ID: 20261014_user_data_integrity.sql
-- All operations are idempotent (IF NOT EXISTS / safe alter).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ENHANCE PROFILES TABLE (Username, Bio, Website, Timestamps)
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT DEFAULT '';

-- Unique index on username (ignoring nulls)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_unique ON public.profiles(username) WHERE username IS NOT NULL;

-- Ensure delete policy exists for profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_delete_own'
    ) THEN
        CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id OR auth.role() = 'service_role');
    END IF;
END $$;


-- ------------------------------------------------------------------------------
-- 2. ENHANCE YOUTUBE CHANNELS TABLE (View Count, Status, Timestamps, Error Tracking)
-- ------------------------------------------------------------------------------
ALTER TABLE public.youtube_channels ADD COLUMN IF NOT EXISTS view_count TEXT DEFAULT '0';
ALTER TABLE public.youtube_channels ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE public.youtube_channels ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.youtube_channels ADD COLUMN IF NOT EXISTS sync_error TEXT;

-- Composite indexes for fast query resolution
CREATE INDEX IF NOT EXISTS idx_yt_channels_user_status ON public.youtube_channels(user_id, status);
CREATE INDEX IF NOT EXISTS idx_yt_channels_updated_at ON public.youtube_channels(updated_at DESC);


-- ------------------------------------------------------------------------------
-- 3. ENHANCE AUDIT EVENTS TABLE (User Activity Log, Status & Safe Description)
-- ------------------------------------------------------------------------------
ALTER TABLE public.audit_events ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'success';
ALTER TABLE public.audit_events ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';

-- Additional indexes for activity feeds
CREATE INDEX IF NOT EXISTS idx_audit_events_user_created ON public.audit_events(user_id, created_at DESC);

-- Ensure delete policy exists for audit_events (for account cleanup)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'audit_events' AND policyname = 'audit_events_delete'
    ) THEN
        CREATE POLICY "audit_events_delete" ON public.audit_events FOR DELETE USING (auth.uid() = user_id OR auth.role() = 'service_role');
    END IF;
END $$;


-- ------------------------------------------------------------------------------
-- 4. ENHANCE USER PREFERENCES POLICIES
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_preferences' AND policyname = 'user_pref_delete'
    ) THEN
        CREATE POLICY "user_pref_delete" ON public.user_preferences FOR DELETE USING (auth.uid() = user_id OR auth.role() = 'service_role');
    END IF;
END $$;


-- ------------------------------------------------------------------------------
-- 5. IMPROVED SAFE PROFILE CREATION TRIGGER
-- Avoids overwriting existing profile data with empty or null strings during login/sync.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    extracted_name TEXT;
    extracted_avatar TEXT;
    base_username TEXT;
BEGIN
    -- Extract real display name from OAuth / Auth metadata
    extracted_name := COALESCE(
        NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
        NULLIF(NEW.raw_user_meta_data->>'name', ''),
        NULLIF(NEW.raw_user_meta_data->>'display_name', ''),
        NULLIF(CONCAT_WS(' ', NEW.raw_user_meta_data->>'given_name', NEW.raw_user_meta_data->>'family_name'), ''),
        split_part(NEW.email, '@', 1)
    );

    -- Extract avatar picture from OAuth metadata
    extracted_avatar := COALESCE(
        NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
        NULLIF(NEW.raw_user_meta_data->>'picture', ''),
        ''
    );

    -- Generate a clean default username candidate
    base_username := LOWER(REGEXP_REPLACE(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9_]', '_', 'g'));

    -- Safe Upsert into public.profiles:
    -- Preserves user's custom changes if they already edited their display_name or avatar.
    INSERT INTO public.profiles (id, email, display_name, avatar_url, username)
    VALUES (
        NEW.id,
        NEW.email,
        extracted_name,
        extracted_avatar,
        base_username
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        display_name = COALESCE(NULLIF(public.profiles.display_name, ''), EXCLUDED.display_name),
        avatar_url = COALESCE(NULLIF(public.profiles.avatar_url, ''), EXCLUDED.avatar_url),
        updated_at = NOW();

    -- Ensure initial preferences exist
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Record signup audit event
    INSERT INTO public.audit_events (user_id, event_type, entity_type, entity_id, description, status)
    VALUES (NEW.id, 'user_signed_up', 'auth.users', NEW.id::text, 'User account registered and initialized', 'success')
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reattach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

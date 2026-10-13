-- ==============================================================================
-- TubePilot AI - Production Relational Database Schema & Row-Level Security (RLS)
-- Target Platform: Supabase PostgreSQL
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE (Associated with auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. PROJECTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    format TEXT NOT NULL DEFAULT 'short',
    ratio TEXT NOT NULL DEFAULT '9:16',
    layout TEXT NOT NULL DEFAULT 'single',
    target_duration NUMERIC(10, 2) NOT NULL DEFAULT 60.0,
    instructions TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- ------------------------------------------------------------------------------
-- 3. SOURCE MEDIA METADATA
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.source_media (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL DEFAULT 'video',
    filename TEXT NOT NULL,
    storage_path TEXT,
    duration NUMERIC(10, 2),
    resolution TEXT,
    filesize BIGINT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_source_media_project ON public.source_media(project_id);
CREATE INDEX IF NOT EXISTS idx_source_media_user ON public.source_media(user_id);

-- ------------------------------------------------------------------------------
-- 4. EDITING PLANS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.editing_plans (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_data JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'ready_for_review',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_editing_plans_project ON public.editing_plans(project_id);
CREATE INDEX IF NOT EXISTS idx_editing_plans_user ON public.editing_plans(user_id);

-- ------------------------------------------------------------------------------
-- 5. RENDERING & AGENT JOBS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jobs (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (
        status IN (
            'queued',
            'analyzing',
            'awaiting_approval',
            'processing',
            'quality_check',
            'ready_to_publish',
            'publishing',
            'completed',
            'failed',
            'cancelled',
            'needs_attention'
        )
    ),
    step INTEGER NOT NULL DEFAULT 1,
    total_steps INTEGER NOT NULL DEFAULT 6,
    progress_pct INTEGER NOT NULL DEFAULT 0,
    log_text TEXT NOT NULL DEFAULT '',
    media_url TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);

-- ------------------------------------------------------------------------------
-- 6. GENERATED OUTPUTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.outputs (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    media_url TEXT NOT NULL,
    duration NUMERIC(10, 2),
    resolution TEXT,
    filesize BIGINT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outputs_project ON public.outputs(project_id);
CREATE INDEX IF NOT EXISTS idx_outputs_user ON public.outputs(user_id);

-- ------------------------------------------------------------------------------
-- 7. CAPTIONS & METADATA TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.captions_metadata (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    language TEXT NOT NULL DEFAULT 'en',
    cues JSONB NOT NULL DEFAULT '[]'::jsonb,
    srt_content TEXT NOT NULL DEFAULT '',
    vtt_content TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_captions_project ON public.captions_metadata(project_id);
CREATE INDEX IF NOT EXISTS idx_captions_user ON public.captions_metadata(user_id);

-- ------------------------------------------------------------------------------
-- 8. CONNECTED YOUTUBE CHANNEL RECORDS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.youtube_channels (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    channel_id TEXT NOT NULL,
    channel_title TEXT NOT NULL,
    channel_handle TEXT,
    avatar_url TEXT,
    subscriber_count TEXT DEFAULT '0',
    video_count TEXT DEFAULT '0',
    connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_channel UNIQUE (user_id, channel_id)
);

CREATE INDEX IF NOT EXISTS idx_yt_channels_user ON public.youtube_channels(user_id);

-- ------------------------------------------------------------------------------
-- 9. PUBLISHING HISTORY
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.publishing_history (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    video_title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    privacy_status TEXT NOT NULL DEFAULT 'unlisted',
    youtube_video_id TEXT,
    youtube_url TEXT,
    status TEXT NOT NULL DEFAULT 'published',
    error_message TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pub_history_user ON public.publishing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_pub_history_created_at ON public.publishing_history(created_at DESC);

-- ------------------------------------------------------------------------------
-- 10. USER PREFERENCES & USAGE RECORDS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    editor_settings JSONB NOT NULL DEFAULT '{"autoSave": true, "snapTimeline": true, "defaultRatio": "9:16"}'::jsonb,
    theme TEXT NOT NULL DEFAULT 'pure-black',
    quota_usage JSONB NOT NULL DEFAULT '{"renders_this_month": 0, "storage_mb_used": 0}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) - ALL 10 TABLES
-- ==============================================================================

-- 1. Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Projects RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- 3. Source Media RLS
ALTER TABLE public.source_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own source media" ON public.source_media FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own source media" ON public.source_media FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own source media" ON public.source_media FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own source media" ON public.source_media FOR DELETE USING (auth.uid() = user_id);

-- 4. Editing Plans RLS
ALTER TABLE public.editing_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own editing plans" ON public.editing_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own editing plans" ON public.editing_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own editing plans" ON public.editing_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own editing plans" ON public.editing_plans FOR DELETE USING (auth.uid() = user_id);

-- 5. Jobs RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own jobs" ON public.jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own jobs" ON public.jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own jobs" ON public.jobs FOR DELETE USING (auth.uid() = user_id);

-- 6. Outputs RLS
ALTER TABLE public.outputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own outputs" ON public.outputs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own outputs" ON public.outputs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own outputs" ON public.outputs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own outputs" ON public.outputs FOR DELETE USING (auth.uid() = user_id);

-- 7. Captions Metadata RLS
ALTER TABLE public.captions_metadata ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own captions" ON public.captions_metadata FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own captions" ON public.captions_metadata FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own captions" ON public.captions_metadata FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own captions" ON public.captions_metadata FOR DELETE USING (auth.uid() = user_id);

-- 8. YouTube Channels RLS
ALTER TABLE public.youtube_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own channel records" ON public.youtube_channels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own channel records" ON public.youtube_channels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own channel records" ON public.youtube_channels FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own channel records" ON public.youtube_channels FOR DELETE USING (auth.uid() = user_id);

-- 9. Publishing History RLS
ALTER TABLE public.publishing_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own publishing history" ON public.publishing_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own publishing history" ON public.publishing_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own publishing history" ON public.publishing_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own publishing history" ON public.publishing_history FOR DELETE USING (auth.uid() = user_id);

-- 10. User Preferences RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

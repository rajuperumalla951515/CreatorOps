-- ==============================================================================
-- TubePilot AI / CreatorOps - Secure Server-Side OAuth Token Persistence
-- Target Platform: Supabase PostgreSQL (xepcqtvzehjnijdvjcfe.supabase.co)
-- Migration ID: 20261014_secure_oauth_tokens.sql
-- ==============================================================================

-- 1. Create user_oauth_tokens table
CREATE TABLE IF NOT EXISTS public.user_oauth_tokens (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'google',
    token_data JSONB NOT NULL,
    scopes TEXT[] NOT NULL DEFAULT '{}',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_provider UNIQUE (user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_user_oauth_tokens_user ON public.user_oauth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_oauth_tokens_provider ON public.user_oauth_tokens(user_id, provider);

-- 2. Strict Row Level Security (RLS)
-- Standard frontend clients (anon and authenticated) CANNOT read, insert, or modify tokens.
-- Exclusively the backend service_role has access to this table.
ALTER TABLE public.user_oauth_tokens ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_oauth_tokens' AND policyname = 'oauth_tokens_service_role_all'
    ) THEN
        CREATE POLICY "oauth_tokens_service_role_all" ON public.user_oauth_tokens
            FOR ALL
            USING (auth.role() = 'service_role')
            WITH CHECK (auth.role() = 'service_role');
    END IF;
END $$;

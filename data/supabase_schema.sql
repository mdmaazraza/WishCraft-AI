-- ====================================================================
-- Wish Yours — Supabase Database Migration & RLS Security Policies
-- Table: scheduled_wishes
-- ====================================================================

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.scheduled_wishes (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    greeting_id TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    recipient_email TEXT,
    recipient_phone TEXT,
    delivery_method TEXT NOT NULL DEFAULT 'email' CHECK (delivery_method IN ('email', 'sms', 'call')),
    scheduled_at TIMESTAMPTZ NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    personal_message TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'processing', 'sent', 'failed', 'cancelled')),
    attempts INTEGER NOT NULL DEFAULT 0,
    sent_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    error_message TEXT,
    provider_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Indexes for high-performance scheduling queries
CREATE INDEX IF NOT EXISTS idx_scheduled_wishes_status_time ON public.scheduled_wishes (status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_wishes_user_id ON public.scheduled_wishes (user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_wishes_greeting_id ON public.scheduled_wishes (greeting_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.scheduled_wishes ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Users can view their own scheduled wishes
CREATE POLICY "Users can view own scheduled wishes"
    ON public.scheduled_wishes FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can create scheduled wishes
CREATE POLICY "Users can create scheduled wishes"
    ON public.scheduled_wishes FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can update only their own scheduled wishes (and only if not sent)
CREATE POLICY "Users can update own scheduled wishes"
    ON public.scheduled_wishes FOR UPDATE
    USING (auth.uid() = user_id AND status <> 'sent');

-- Users can delete their own scheduled wishes
CREATE POLICY "Users can delete own scheduled wishes"
    ON public.scheduled_wishes FOR DELETE
    USING (auth.uid() = user_id);

-- 5. Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_scheduled_wishes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_scheduled_wishes_updated_at ON public.scheduled_wishes;
CREATE TRIGGER trg_scheduled_wishes_updated_at
    BEFORE UPDATE ON public.scheduled_wishes
    FOR EACH ROW
    EXECUTE FUNCTION update_scheduled_wishes_timestamp();

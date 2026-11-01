-- ====================================================================
-- Wish Yours — Supabase Database Schema & Row Level Security (RLS)
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users Profile Table (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Wishes Table (Store digital greetings)
CREATE TABLE IF NOT EXISTS public.wishes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    sender_name TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    recipient_gender TEXT,
    occasion TEXT NOT NULL,
    relationship TEXT NOT NULL,
    style TEXT NOT NULL DEFAULT 'Heart-touching',
    theme TEXT NOT NULL DEFAULT 'birthday_celebration',
    language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'hi', 'hinglish')),
    message TEXT NOT NULL,
    memories TEXT,
    relationship_duration TEXT,
    age INT,
    anniversary_years INT,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    music_track TEXT NOT NULL DEFAULT 'festive_melody',
    is_public BOOLEAN NOT NULL DEFAULT true,
    views_count INT NOT NULL DEFAULT 0,
    candles_blown BOOLEAN NOT NULL DEFAULT false,
    custom_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ
);

-- 4. Email Logs Table (Track email deliveries)
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wish_id UUID REFERENCES public.wishes(id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'simulated')),
    provider TEXT NOT NULL DEFAULT 'resend',
    message_id TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Greeting Templates Table
CREATE TABLE IF NOT EXISTS public.templates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    occasion TEXT NOT NULL,
    relationship TEXT NOT NULL,
    theme TEXT NOT NULL,
    style TEXT NOT NULL,
    sample_message TEXT NOT NULL,
    preview_gradient TEXT NOT NULL DEFAULT 'from-pink-500 to-rose-600',
    is_trending BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Indexes for High Performance
CREATE INDEX IF NOT EXISTS idx_wishes_slug ON public.wishes(slug);
CREATE INDEX IF NOT EXISTS idx_wishes_sender_id ON public.wishes(sender_id);
CREATE INDEX IF NOT EXISTS idx_wishes_occasion ON public.wishes(occasion);
CREATE INDEX IF NOT EXISTS idx_wishes_created_at ON public.wishes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_wish_id ON public.email_logs(wish_id);

-- 7. Supabase Storage Bucket setup for uploaded photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('wish-photos', 'wish-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Anyone can view uploaded wish photos
CREATE POLICY "Public wish photos access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'wish-photos');

-- Storage Policy: Anyone (including guests) can upload wish photos
CREATE POLICY "Public wish photos upload" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'wish-photos');

-- 8. Row Level Security (RLS) Setup
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Wishes RLS Policies:
-- A) Public wishes can be viewed by anyone using the slug
CREATE POLICY "Anyone can view public wishes" 
ON public.wishes FOR SELECT 
USING (is_public = true OR auth.uid() = sender_id);

-- B) Anyone (authenticated or guest) can create a wish
CREATE POLICY "Anyone can insert wishes" 
ON public.wishes FOR INSERT 
WITH CHECK (true);

-- C) Users can update their own wishes
CREATE POLICY "Users can update their own wishes" 
ON public.wishes FOR UPDATE 
USING (auth.uid() = sender_id);

-- D) Users can delete their own wishes
CREATE POLICY "Users can delete their own wishes" 
ON public.wishes FOR DELETE 
USING (auth.uid() = sender_id);

-- Templates RLS:
CREATE POLICY "Templates are viewable by everyone" 
ON public.templates FOR SELECT 
USING (true);

-- Users RLS:
CREATE POLICY "Users can read own profile" 
ON public.users FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);

-- Email Logs RLS:
CREATE POLICY "Admins or owners can read email logs" 
ON public.email_logs FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.wishes 
        WHERE wishes.id = email_logs.wish_id 
        AND wishes.sender_id = auth.uid()
    ) 
    OR 
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() AND users.role = 'admin'
    )
);

-- 9. Auto-increment views function
CREATE OR REPLACE FUNCTION public.increment_wish_views(wish_slug TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.wishes 
    SET views_count = views_count + 1 
    WHERE slug = wish_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

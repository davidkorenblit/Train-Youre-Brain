-- ====================================================================
-- CodeReview Arena - Supabase Database Schema
-- Based on docs/code_review.md specifications
-- ====================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Table: challenges (Exercise repository)
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    level INT NOT NULL CHECK (level IN (1, 2, 3)),
    language VARCHAR(30) NOT NULL DEFAULT 'python',
    context_prompt TEXT NOT NULL,
    buggy_code TEXT NOT NULL,
    fixed_code TEXT NOT NULL,
    golden_bugs JSONB NOT NULL DEFAULT '[]'::jsonb,
    source_metadata JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for challenges
CREATE INDEX IF NOT EXISTS idx_challenges_level ON public.challenges(level);
CREATE INDEX IF NOT EXISTS idx_challenges_slug ON public.challenges(slug);
CREATE INDEX IF NOT EXISTS idx_challenges_active ON public.challenges(is_active);

-- 2. Table: users (Gamification, progression, and profile)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    username VARCHAR(50),
    current_level INT DEFAULT 1,
    xp INT DEFAULT 0,
    snr_score FLOAT DEFAULT 1.0,
    streak_days INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Table: submissions (User review submissions and AI scoring)
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
    user_claims JSONB NOT NULL DEFAULT '[]'::jsonb,
    ai_evaluation JSONB,
    total_score INT CHECK (total_score >= 0 AND total_score <= 100),
    tokens_used INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for submissions
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_challenge_id ON public.submissions(challenge_id);

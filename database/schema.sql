
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    category VARCHAR(50) NOT NULL,
    location VARCHAR(150) NOT NULL,
    contact VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_title
        CHECK (char_length(trim(title)) > 0),

    CONSTRAINT valid_description
        CHECK (char_length(trim(description)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_resources_created_at
ON public.resources (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_resources_category
ON public.resources (category);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

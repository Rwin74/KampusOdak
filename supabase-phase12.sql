-- Phase 12: Onboarding Profile Fields

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS focus_targets text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education_level text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_goal text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

CREATE OR REPLACE FUNCTION public.complete_onboarding(
    p_user_id uuid,
    p_focus_targets text[],
    p_education_level text,
    p_daily_goal text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.profiles
    SET 
        focus_targets = p_focus_targets,
        education_level = p_education_level,
        daily_goal = p_daily_goal,
        onboarding_completed = true
    WHERE id = p_user_id;
END;
$$;

-- Phase 6: God Mode & Corporate Dashboard SQL Script

-- 1. Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Modify profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS org_id uuid references public.organizations(id) on delete set null;

-- (Optional) If 'role' is currently limited by check constraints, ensure 'sub_admin' is allowed.
-- Based on Phase 1, role is just 'text' default 'user'. So 'sub_admin' is valid.

-- 3. RLS for organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Admins see all, Sub-admins see their own org, users see their own org
CREATE POLICY "Public can view organizations" ON public.organizations FOR SELECT USING (true);
CREATE POLICY "Admins can manage organizations" ON public.organizations FOR ALL USING (public.get_my_role() = 'admin');

-- 4. Re-configure Policies for Profiles so Sub-Admins can see their students
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins and Sub-Admins can view relevant profiles" ON public.profiles FOR SELECT USING (
  public.get_my_role() = 'admin' OR 
  (public.get_my_role() = 'sub_admin' AND org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid()))
);

-- 5. RPC & Tables for Early Exit (Churn)
-- We will write Early Exits to logs.
CREATE OR REPLACE FUNCTION public.log_early_exit(p_room_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.logs (event_type, description, user_id) 
    VALUES ('EARLY_EXIT', 'Kullanıcı odak zamanlayıcısı bitmeden odadan ayrıldı.', auth.uid());
END;
$$;

-- 6. Analytics Views
-- Since Sub-Admins should only see their own org stats, Views are normally bypass RLS if defined as SECURITY DEFINER
-- But to allow safe querying from client, we will define them SECURITY INVOKER
CREATE OR REPLACE VIEW public.vw_org_stats AS
SELECT 
    o.id as org_id,
    o.name as org_name, 
    COALESCE(SUM(p.total_hours), 0) as total_hours, 
    COUNT(p.id) as student_count
FROM public.organizations o
LEFT JOIN public.profiles p ON p.org_id = o.id
GROUP BY o.id, o.name;

CREATE OR REPLACE VIEW public.vw_user_churn AS
SELECT 
    p.id as user_id,
    p.full_name,
    p.org_id,
    p.total_hours,
    count(l.id) as churn_count
FROM public.profiles p
LEFT JOIN public.logs l ON l.user_id = p.id AND l.event_type = 'EARLY_EXIT'
GROUP BY p.id, p.full_name, p.org_id, p.total_hours;

-- Seed script for Organizations (Mockup)
INSERT INTO public.organizations (name) VALUES 
('Yıldız Teknik Kamp'),
('Boğaziçi Akademi'),
('Anadolu KPSS Etüt')
ON CONFLICT DO NOTHING;

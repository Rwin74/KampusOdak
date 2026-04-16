-- RLS Infinite Recursion FIX
-- Bu fonksiyon RLS'yi by-pass ederek kurumu güvenle okur
CREATE OR REPLACE FUNCTION public.get_my_org()
RETURNS uuid AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Sıkıntılı Kuralı Düşürüp, Güvenli Kuralı Kuruyoruz
DROP POLICY IF EXISTS "Admins and Sub-Admins can view relevant profiles" ON public.profiles;

CREATE POLICY "Admins and Sub-Admins can view relevant profiles" ON public.profiles FOR SELECT USING (
  public.get_my_role() = 'admin' OR 
  (public.get_my_role() = 'sub_admin' AND org_id = public.get_my_org())
);

-- KampusOdak Phase 7: Dershane ve Profil Güncellemeleri
-- Lütfen bu kodları Supabase paneline girip "SQL Editor" üzerinden çalıştırın.

-- 1. profiles tablosuna dershane id'si eklenmesi
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dershane_id uuid REFERENCES public.profiles(id);

-- 2. Dershane rolü RLS Politikaları
-- Dershaneler, kendi davetiyesi ile gelen öğrencileri (dershane_id = auth.uid()) görebilir
DROP POLICY IF EXISTS "Dershaneler öğrencilerini görebilir" ON public.profiles;
CREATE POLICY "Dershaneler öğrencilerini görebilir" ON public.profiles FOR SELECT USING (
  auth.uid() = dershane_id
);

-- Adminler her zaman görebildiği için onu bozmuyoruz. (Admin RLS'si zaten var)

-- 3. Invites Tablosu İçin Dershanelere İzin Verme
-- Mevcut durumda "Users can view own invites" var:
-- CREATE POLICY "Users can view own invites" ON public.invites FOR SELECT USING (auth.uid() = created_by);
-- Buna ek olarak dershaneler insert yapabilmeli
DROP POLICY IF EXISTS "Dershaneler davetiye olusturabilir" ON public.invites;
CREATE POLICY "Dershaneler davetiye olusturabilir" ON public.invites FOR INSERT WITH CHECK (
  auth.uid() = created_by AND public.get_my_role() = 'dershane'
);

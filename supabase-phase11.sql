-- KampusOdak Phase 11: Profil Dershane İsmi Görünürlüğü (RLS Fix)
-- Öğrencilerin "/profile" sayfasında bağlı oldukları kurumun ismini okuyabilmesi için
-- "dershane" rolündeki profillerin okunabilir (SELECT) olması gerekir.

DROP POLICY IF EXISTS "Herkes dershaneleri gorebilir" ON public.profiles;
CREATE POLICY "Herkes dershaneleri gorebilir" ON public.profiles FOR SELECT USING ( role = 'dershane' );

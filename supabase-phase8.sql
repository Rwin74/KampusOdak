-- KampusOdak Phase 8: Davetiye Aktifleştirme (Claim) RLS Politikaları
-- Kullanıcılar kayıt olurken davetiye kodunu "kullanıldı" olarak işaretleyebilsin.

-- 1. Kullanıcıların INVITES tablosunu güncelleyebilmesi için UPDATE izni veriyoruz:
DROP POLICY IF EXISTS "Users can claim invites" ON public.invites;
CREATE POLICY "Users can claim invites" ON public.invites FOR UPDATE USING (
  is_active = true -- sadece açık/boşta olan davetiyeler hedeflenebilir
) WITH CHECK (
  used_by = auth.uid() -- sadece kendisi kullandığını belirtebilir
);

-- Ek not: Profiles tablosunda zaten 'Users can update own profile' politikası (id = auth.uid) bulunduğu için dershane_id sütununu güncelleyebilirler.

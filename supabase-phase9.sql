-- KampusOdak Phase 9: Tam Hesap Silme Motoru (Auth Bypass)
-- Adminlerin "auth.users" tablosundan kalıcı silme işlemi yapabilmesi için yetkili silme fonksiyonu.

CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Fonksiyonun veritabanı yetkilisi (postgres) olarak çalışmasını sağlar
AS $$
BEGIN
  -- Sadece Adminlerin bu işlemi yapmasına izin veriyoruz
  IF (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' THEN
    -- auth.users tablosundan siliyoruz. (Cascade açık olduğu için profiles vb. de otomatik silinecektir)
    DELETE FROM auth.users WHERE id = target_user_id;
  ELSE
    RAISE EXCEPTION 'Sadece Adminler hesap silebilir.';
  END IF;
END;
$$;

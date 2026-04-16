-- KampusOdak Phase 10: Kusursuz Davetiye (Invite) Sistemi ve İade Mekanizması
-- 1) Kayıt sonrası davetiyenin kesin olarak (RLS/Session engeli olmadan) kullanıldı olarak işaretlenmesi.
-- 2) Hesap silindiğinde (Ban/Sil), davetiyenin tekrar aktif (boşta) hale gelerek havuza düşmesi.

-- KISIM 1: SİLİNEN KULLANICININ DAVETİYESİNİ İADE ETME
-- profiles tablosundan bir kayıt silinmeden hemen önce bu fonksiyon tetiklenir:
CREATE OR REPLACE FUNCTION public.free_invite_on_delete()
RETURNS trigger AS $$
BEGIN
  -- Eğer bu kullanıcı bir davetiye kullanmışsa, onu boşa çıkart:
  UPDATE public.invites 
  SET is_active = true, used_by = null 
  WHERE used_by = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger'ı profiles tablosuna ekliyoruz:
DROP TRIGGER IF EXISTS on_profile_delete_free_invite ON public.profiles;
CREATE TRIGGER on_profile_delete_free_invite
  BEFORE DELETE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.free_invite_on_delete();

-- KISIM 2: YENİ KAYITLARDA DAVETİYEYİ VE DERSHANEYİ KESİN ATAMA
-- Signup esnasında Supabase Session henüz aktif değilse RLS'ye takılmayı önlemek için, işlemi en yetkili Trigger üzerinden yapıyoruz.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_invite_code text;
  v_creator_id uuid;
  v_creator_role text;
BEGIN
  -- Yeni kullanıcının kayıtta gönderdiği metadata'dan invite_code'u çekiyoruz
  v_invite_code := new.raw_user_meta_data->>'invite_code';
  
  -- Profiles tablosuna ilk veriyi giriyoruz
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    CASE 
      WHEN new.email = '[BURAYA KENDİ MAİL ADRESİNİ YAZ]' THEN 'admin'
      ELSE 'user'
    END
  );

  -- Eğer sistemde geçerli bir invite_code gönderilmişse:
  IF v_invite_code IS NOT NULL AND v_invite_code != '' THEN
    
    -- Davetiyeyi oluşturan kişiyi bul
    SELECT created_by INTO v_creator_id 
    FROM public.invites 
    WHERE code = v_invite_code AND is_active = true;
    
    -- Davetiye varsa işlemleri yap
    IF v_creator_id IS NOT NULL THEN
      -- Davetiyeyi "Kullanıldı" olarak işaretle
      UPDATE public.invites 
      SET is_active = false, used_by = new.id 
      WHERE code = v_invite_code;
      
      -- Davetiyeyi oluşturan kişi 'dershane' ise, öğrenciyi o dershaneye bağla
      SELECT role INTO v_creator_role FROM public.profiles WHERE id = v_creator_id;
      IF v_creator_role = 'dershane' THEN
        UPDATE public.profiles 
        SET dershane_id = v_creator_id 
        WHERE id = new.id;
      END IF;
      
    END IF;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql security definer;

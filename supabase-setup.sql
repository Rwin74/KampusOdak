-- KampusOdak Supabase Kurulum ve Seed Script'i
-- Lütfen bu kodları Supabase paneline girip "SQL Editor" üzerinden çalıştırın.

-- 1. Tabloların Oluşturulması

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  total_hours numeric default 0,
  streak integer default 0,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE IF NOT EXISTS public.invites (
  code text primary key,
  created_by uuid references public.profiles(id) on delete cascade,
  used_by uuid references public.profiles(id),
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE IF NOT EXISTS public.trivia (
  id serial primary key,
  category text not null,
  question text not null,
  options jsonb not null,
  correct_answer text not null
);

CREATE TABLE IF NOT EXISTS public.logs (
  id uuid default gen_random_uuid() primary key,
  event_type text not null,
  description text not null,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Auth.Users ile Profiles Tablosunun Senkronize Edilmesi (Triggers)
-- (Kullanıcı kayıt olduğunda otomatik profile oluştur ve admin mailini kontrol et)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    CASE 
      -- BURAYA ADMIN OLACAK EMAIL ADRESINI YAZIN (ŞUAN KULLANICININ İSTEDİĞİ GİBİ HARDKODLANMIŞTIR)
      WHEN new.email = '[BURAYA KENDİ MAİL ADRESİNİ YAZ]' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql security definer;

-- Trigger'ı auth.users tablosu için oluştur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Row Level Security (RLS) Ayarları

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trivia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Herkes trivia sorularını okuyabilir
CREATE POLICY "Public Read Trivia" ON public.trivia FOR SELECT USING (true);

-- Kullanıcılar kendi profillerini görebilir ve güncelleyebilir
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS By-pass (Sonsuz döngüyü önlemek) için admin rol kontrolcüsü
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Adminler tüm profilleri görebilir ve silebilir (Hard Ban)
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  public.get_my_role() = 'admin'
);
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE USING (
  public.get_my_role() = 'admin'
);
CREATE POLICY "Admins can update profiles" ON public.profiles FOR UPDATE USING (
  public.get_my_role() = 'admin'
);

-- Sistemde olan kullanıcılar aktif kendi ürettiği davetiyeleri görebilir
CREATE POLICY "Users can view own invites" ON public.invites FOR SELECT USING (auth.uid() = created_by);

-- Davetiyeleri sadece anonim (kayıt olmaya çalışan) kişiler login olmadan kullanıp geçerli olup olmadığını kontrol edebilir
CREATE POLICY "Anyone can read active invites" ON public.invites FOR SELECT USING (is_active = true);

-- Adminler her davetiyeyi görebilir, oluşturabilir ve silebilir
CREATE POLICY "Admins can do everything on invites" ON public.invites FOR ALL USING (
  public.get_my_role() = 'admin'
);

-- Logları sadece adminler görebilir
CREATE POLICY "Admins can view logs" ON public.logs FOR SELECT USING (
  public.get_my_role() = 'admin'
);
-- Sadece sistem/admin log ekleyebilir (Client-side edge case'ler için geçici allowed insert)
CREATE POLICY "Users can insert logs" ON public.logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Initial Trivia Seed Data (Matchmaking ekranını test etmek için)

INSERT INTO public.trivia (category, question, options, correct_answer) VALUES
('YKS', 'Cumhuriyet dönemi Türk edebiyatında "Yedi Meşaleciler" topluluğunun kurucularından biri kimdir?', '["Orhan Veli Kanık", "Ziya Osman Saba", "Nazım Hikmet", "Ahmet Haşim"]', 'Ziya Osman Saba'),
('YKS', 'Aşağıdaki elementlerden hangisi bir soygazdır?', '["Hidrojen", "Oksijen", "Argon", "Azot"]', 'Argon'),
('YKS', 'Türkiye''nin en büyük gölü hangisidir?', '["Tuz Gölü", "Beyşehir Gölü", "Van Gölü", "Eğirdir Gölü"]', 'Van Gölü'),
('KPSS', 'Türkiye Anayasasına göre, Cumhurbaşkanı kaç yıllığına seçilir?', '["4", "5", "7", "Yoktur"]', '5'),
('KPSS', '"İstiklal Marşı" şairimiz kimdir?', '["Mehmet Akif Ersoy", "Namık Kemal", "Tevfik Fikret", "Yahya Kemal Beyatlı"]', 'Mehmet Akif Ersoy'),
('KPSS', '1. Dünya Savaşı''nda Osmanlı İmparatorluğu''nun İngilizleri yendiği ünlü cephe neresidir?', '["Çanakkale", "Suriye", "Kafkas", "Galiçya"]', 'Çanakkale'),
('Üniversite', 'Genetik bilimine temel oluşturan çalışmalarıyla tanınan bilim insanı kimdir?', '["Charles Darwin", "Gregor Mendel", "Louis Pasteur", "Isaac Newton"]', 'Gregor Mendel'),
('Üniversite', 'Bilgisayar biliminin Nobel''i sayılan ödül nedir?', '["Turing Ödülü", "Nobel Fizik Ödülü", "Fields Madalyası", "Abel Ödülü"]', 'Turing Ödülü'),
('YKS', 'Aşağıdaki gezegenlerden hangisi "Kızıl Gezegen" olarak bilinir?', '["Venüs", "Mars", "Jüpiter", "Satürn"]', 'Mars'),
('Üniversite', 'Yapay zekanın temel testi sayılan ve makinenin insan gibi davranıp davranmadığını ölçen testin adı nedir?', '["Turing Testi", "CAPTCHA", "Rorschach Testi", "IQ Testi"]', 'Turing Testi');

-- Seed Script Sonu

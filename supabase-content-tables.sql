-- Tablolar: Bilgi Köşesi ve Haberler
-- Bu tablolar dashboard'da aşağı kaydırdıkça görünecek içerikler için

-- Bilgi Köşesi Tablosu
CREATE TABLE IF NOT EXISTS bilgi_kosesi (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  baslik TEXT NOT NULL,
  icerik TEXT NOT NULL,
  kategori TEXT DEFAULT 'genel', -- genel, ytks, kpss, universite vb.
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Haberler Tablosu
CREATE TABLE IF NOT EXISTS haberler (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  baslik TEXT NOT NULL,
  icerik TEXT NOT NULL,
  link TEXT, -- detaylı haber için link (opsiyonel)
  kategori TEXT DEFAULT 'genel', -- okul, sinav, duyuru vb.
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Aktifleştir
ALTER TABLE bilgi_kosesi ENABLE ROW LEVEL SECURITY;
ALTER TABLE haberler ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir
CREATE POLICY "bilgi_kosesi_herkese_okuyabilir" ON bilgi_kosesi FOR SELECT USING (true);
CREATE POLICY "haberler_herkese_okuyabilir" ON haberler FOR SELECT USING (true);

-- Sadece admin/sub_admin yazabilir
CREATE POLICY "bilgi_kosesi_admin_yazabilir" ON bilgi_kosesi FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'sub_admin')
  )
);

CREATE POLICY "bilgi_kosesi_admin_guncelleyebilir" ON bilgi_kosesi FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'sub_admin')
  )
);

CREATE POLICY "bilgi_kosesi_admin_silebilir" ON bilgi_kosesi FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "haberler_admin_yazabilir" ON haberler FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'sub_admin')
  )
);

CREATE POLICY "haberler_admin_guncelleyebilir" ON haberler FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'sub_admin')
  )
);

CREATE POLICY "haberler_admin_silebilir" ON haberler FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Örnek Veriler (Silinmek istenirse kaldırılabilir)
INSERT INTO bilgi_kosesi (baslik, icerik, kategori) VALUES
('Pomodoro Tekniği Nedir?', 'Pomodoro tekniği, 25 dakika çalışıp 5 dakika mola veren bir zaman yönetimi yöntemidir. Bu teknik, odaklanmayı artırır ve verimliliği yükseltir.', 'genel'),
('YKS Sınav Stratejisi', 'YKS sınavında başarı için erken başlamak, düzenli çalışmak ve deneme çözmek çok önemlidir. Her gün en az 2 saat çalışmayı hedefleyin.', 'ytks'),
('Sınav Stresi ile Başa Çıkma', 'Sınav stresi ile başa çıkmak için düzenli uyku, sağlıklı beslenme ve egzersiz yapmak gerekir. Ayrıca nefes egzersizleri de yardımcı olabilir.', 'genel')
ON CONFLICT DO NOTHING;

INSERT INTO haberler (baslik, icerik, link, kategori) VALUES
('2025 YKS Başvuruları Başladı', '2025 YKS başvuruları ÖSYM tarafından başlatıldı. Başvurular 15 Mart'a kadar devam edecek.', 'https://www.osym.gov.tr', 'sinav'),
('Üniversite Kayıtları İçin Son Tarih', '2024-2025 eğitim öğretim yılı üniversite kayıtları için son tarih 15 Eylül olarak belirlendi.', 'https://www.yok.gov.tr', 'okul'),
('Yeni Burs İlanları', 'Kredi ve Yurtlar Kurumu tarafından yeni burs imkanları açıklandı. Başvurular online olarak alınacak.', 'https://www.kyk.gov.tr', 'duyuru')
ON CONFLICT DO NOTHING;

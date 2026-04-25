-- Tablolar: Bilgi Köşesi ve Haberler
-- Bu tablolar dashboard'da aşağı kaydırdıkça görünecek içerikler için

-- Bilgi Köşesi Tablosu
CREATE TABLE IF NOT EXISTS bilgi_kosesi (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  baslik TEXT NOT NULL,
  icerik TEXT NOT NULL,
  kategori TEXT DEFAULT 'genel',
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Haberler Tablosu
CREATE TABLE IF NOT EXISTS haberler (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  baslik TEXT NOT NULL,
  icerik TEXT NOT NULL,
  link TEXT,
  kategori TEXT DEFAULT 'genel',
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

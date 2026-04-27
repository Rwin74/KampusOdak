import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const BASE_URL = 'https://kampusodak.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'KampüsOdak | Online Kütüphane & Dijital Çalışma Platformu',
    template: '%s | KampüsOdak',
  },
  description:
    'KampüsOdak, Türkiye\'nin en gelişmiş online kütüphanesi ve dijital çalışma platformudur. Öğrenciler için canlı odak odaları, akıllı eşleştirme ve kampüs ekosistemi — her yerden, sıfır trol, %100 odak.',
  keywords: [
    'online kütüphane',
    'kampüs odak',
    'kampüsodak',
    'dijital kütüphane',
    'çevrimiçi çalışma odası',
    'online çalışma platformu',
    'öğrenci odak uygulaması',
    'sanal kütüphane',
    'YKS çalışma odası',
    'KPSS odak platformu',
    'dijital okuma salonu',
    'online study room',
    'türkiye online kütüphane',
    'odak odası',
    'kampüs ekosistemi',
  ],
  authors: [{ name: 'KampüsOdak', url: BASE_URL }],
  creator: 'KampüsOdak',
  publisher: 'KampüsOdak',
  category: 'Education',
  classification: 'Eğitim / Online Kütüphane',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: BASE_URL,
    siteName: 'KampüsOdak',
    title: 'KampüsOdak | Online Kütüphane & Dijital Çalışma Platformu',
    description:
      'Türkiye\'nin en kapsamlı online kütüphanesi. Canlı odak odaları, akıllı eşleştirme ve kampüs ekosistemi ile hedeflerine ulaş.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KampüsOdak – Online Kütüphane & Dijital Çalışma Platformu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KampüsOdak | Online Kütüphane & Dijital Çalışma Platformu',
    description:
      'Türkiye\'nin en kapsamlı online kütüphanesi. Canlı odak odaları ve kampüs ekosistemi ile çalış.',
    images: ['/og-image.png'],
    creator: '@kampusodak',
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      'tr-TR': BASE_URL,
    },
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [
      { rel: 'android-chrome-192x192', url: '/android-chrome-192x192.png' },
      { rel: 'android-chrome-512x512', url: '/android-chrome-512x512.png' },
    ],
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'googleee526f6a32479162',
  },
};

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      url: BASE_URL,
      name: 'KampüsOdak',
      description: 'Türkiye\'nin online kütüphane ve dijital çalışma platformu',
      inLanguage: 'tr-TR',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${BASE_URL}/?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'KampüsOdak',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
        width: 512,
        height: 512,
      },
      sameAs: [],
      description: 'KampüsOdak, öğrenciler için Türkiye\'nin en gelişmiş online kütüphane ve dijital çalışma platformudur.',
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${BASE_URL}/#app`,
      name: 'KampüsOdak',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      url: BASE_URL,
      description: 'Online kütüphane ve canlı odak odaları ile öğrencilere kesintisiz dijital çalışma ortamı sunan platform.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'TRY',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '1200',
        bestRating: '5',
      },
      featureList: [
        'Online Kütüphane',
        'Canlı Odak Odaları',
        'Akıllı Eşleştirme Sistemi',
        'Kampüs Ekosistemi',
        'XP ve Gamification',
        'Video Akademi',
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="dark">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="canonical" href={BASE_URL} />
        <meta name="theme-color" content="#F59E0B" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="KampüsOdak" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="geo.region" content="TR" />
        <meta name="geo.country" content="Turkey" />
        <meta name="language" content="Turkish" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}

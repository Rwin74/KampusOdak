import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Giriş Yap | KampüsOdak – Online Kütüphane',
  description:
    'KampüsOdak online kütüphanesine giriş yapın. Türkiye\'nin en kapsamlı dijital çalışma platformunda binlerce öğrenciyle birlikte odaklanın. Davetiye ile ücretsiz kayıt.',
  keywords: [
    'kampüsodak giriş',
    'online kütüphane giriş',
    'kampüs odak kayıt',
    'dijital çalışma platformu',
    'online kütüphane türkiye',
  ],
  alternates: {
    canonical: 'https://kampusodak.com',
  },
  openGraph: {
    title: 'KampüsOdak – Online Kütüphane & Dijital Çalışma Platformu',
    description:
      'Türkiye\'nin en kapsamlı online kütüphanesi. Davetiye ile katıl, hedeflerine odaklan.',
    url: 'https://kampusodak.com',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

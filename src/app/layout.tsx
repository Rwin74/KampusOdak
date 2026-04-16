import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KampusOdak | Dijital Odaklanma Kütüphanesi',
  description: 'Türkiye\'nin ilk davetiye usulü dijital akademik odaklanma platformu. Sıfır trol, %100 odak.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

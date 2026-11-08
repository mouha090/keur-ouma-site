import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kër Ouma — Thiouraye, créations et art de vivre sénégalais',
  description: 'Kër Ouma, maison inspirée par le Sénégal : thiouraye et encens (Cocaine, Naaka Jeddah, Gowé, Diguidié Saff), étoffes, saveurs, mode et coffrets.',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#F7F3EB' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300..600&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

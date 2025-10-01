/**
 * Root Layout Component
 * Provides metadata, fonts, and global providers for the application
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppWalletProvider from '@/components/providers/WalletProvider';

// Configure Inter font
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Application metadata
export const metadata: Metadata = {
  title: 'DLMM Portfolio Dashboard | Saros Finance',
  description: 'Advanced portfolio analytics and management for Saros DLMM liquidity providers',
  keywords: 'Saros, DLMM, DeFi, Solana, Liquidity, Portfolio, Analytics',
  authors: [{ name: 'Saros Finance' }],
  creator: 'Saros Finance',
  publisher: 'Saros Finance',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://saros.finance'),
  openGraph: {
    title: 'DLMM Portfolio Dashboard | Saros Finance',
    description: 'Advanced portfolio analytics and management for Saros DLMM liquidity providers',
    url: 'https://saros.finance',
    siteName: 'Saros Finance',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Saros DLMM Portfolio Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DLMM Portfolio Dashboard | Saros Finance',
    description: 'Advanced portfolio analytics and management for Saros DLMM liquidity providers',
    images: ['/og-image.png'],
    creator: '@SarosFinance',
  },
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
  verification: {
    google: 'your-google-verification-code',
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Root Layout Component
 * Wraps the entire application with providers and global styles
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <AppWalletProvider>
          {children}
        </AppWalletProvider>
      </body>
    </html>
  );
}

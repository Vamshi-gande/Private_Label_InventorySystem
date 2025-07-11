import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { Layout } from '@/components';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Private Label Inventory System',
  description: 'AI-driven inventory management system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from 'next';
import '@mantine/core/styles.css';
import './globals.css';
import { MantineSetup } from '@/components/MantineSetup';

export const metadata: Metadata = {
  title: '我が家の献立',
  description: '家族の献立を管理するアプリ',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#F97316',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <MantineSetup>{children}</MantineSetup>
      </body>
    </html>
  );
}

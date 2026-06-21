import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Mantine v9 の ESM ビルドは React の実験的 API (Activity, useEffectEvent) を
    // import するため Next.js の webpack では解決できない。CJS ビルドを使用する。
    // $ suffix = exact match only (サブパス @mantine/core/styles.css は対象外)
    config.resolve.alias = {
      ...config.resolve.alias,
      '@mantine/core$': path.join(process.cwd(), 'node_modules/@mantine/core/cjs/index.cjs'),
      '@mantine/hooks$': path.join(process.cwd(), 'node_modules/@mantine/hooks/cjs/index.cjs'),
    };
    return config;
  },
};

export default nextConfig;

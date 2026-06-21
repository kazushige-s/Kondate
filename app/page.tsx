'use client';

import dynamic from 'next/dynamic';

// Mantine v9 の一部フック (useEffectEvent 等) はサーバー環境で動作しないため
// SSR を無効化してクライアントのみで描画する
const ClientPage = dynamic(() => import('./client-page'), { ssr: false });

export default function Page() {
  return <ClientPage />;
}

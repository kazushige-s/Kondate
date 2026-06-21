import { Client } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import type { Meal } from '@/types';

export const notion = new Client({ auth: process.env.NOTION_TOKEN });
export const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props = Record<string, any>;

export function parseMeal(page: PageObjectResponse): Meal {
  const p = page.properties as Props;
  return {
    id: page.id,
    name: p['献立']?.title?.[0]?.plain_text ?? '',
    date: p['日付']?.date?.start ?? '',
    season: p['季節限定']?.multi_select?.[0]?.name ?? null,
    isReady: p['食材あり']?.checkbox ?? false,
  };
}

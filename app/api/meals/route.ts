import { NextRequest, NextResponse } from 'next/server';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { notion, DATABASE_ID, parseMeal } from '@/lib/notion';

export async function GET() {
  try {
    const results = [];
    let cursor: string | undefined;
    do {
      const response = await notion.databases.query({
        database_id: DATABASE_ID,
        sorts: [{ property: '日付', direction: 'descending' }],
        start_cursor: cursor,
      });
      for (const page of response.results) {
        if (page.object === 'page') {
          results.push(parseMeal(page as PageObjectResponse));
        }
      }
      cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
    } while (cursor);
    return NextResponse.json(results);
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, date, season } = (await req.json()) as {
      name?: string;
      date?: string;
      season?: string;
    };
    if (!name) {
      return NextResponse.json({ error: '献立名は必須です' }, { status: 400 });
    }

    const properties: Record<string, unknown> = {
      '献立': { title: [{ text: { content: name } }] },
      ...(date ? { '日付': { date: { start: date } } } : {}),
    };
    if (season) properties['季節限定'] = { multi_select: [{ name: season }] };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: properties as any,
    });
    return NextResponse.json(parseMeal(page as PageObjectResponse));
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

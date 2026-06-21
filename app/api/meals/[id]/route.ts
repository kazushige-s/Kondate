import { NextRequest, NextResponse } from 'next/server';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { notion, parseMeal } from '@/lib/notion';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { date, name, isReady, season } = (await req.json()) as {
      date?: string;
      name?: string;
      isReady?: boolean;
      season?: string | null;
    };

    const properties: Record<string, unknown> = {};
    if (name !== undefined)     properties['献立']    = { title: [{ text: { content: name } }] };
    if (date !== undefined)     properties['日付']    = date ? { date: { start: date } } : { date: null };
    if (isReady !== undefined)  properties['食材あり'] = { checkbox: isReady };
    if (season !== undefined)   properties['季節限定'] = season
      ? { multi_select: [{ name: season }] }
      : { multi_select: [] };

    if (Object.keys(properties).length === 0) {
      return NextResponse.json({ error: '更新する項目がありません' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page = await notion.pages.update({ page_id: id, properties: properties as any });
    return NextResponse.json(parseMeal(page as PageObjectResponse));
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await notion.pages.update({ page_id: id, archived: true });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

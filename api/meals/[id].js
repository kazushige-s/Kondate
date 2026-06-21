const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });

function parseMeal(page) {
  return {
    id: page.id,
    name: page.properties['献立']?.title?.[0]?.plain_text ?? '',
    date: page.properties['日付']?.date?.start ?? '',
    season: page.properties['季節限定']?.multi_select?.[0]?.name ?? null,
    isReady: page.properties['食材あり']?.checkbox ?? false,
  };
}

module.exports = async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PATCH') {
    const { date, name, isReady, season } = req.body;
    const properties = {};
    if (name !== undefined) {
      properties['献立'] = { title: [{ text: { content: name } }] };
    }
    if (date !== undefined) {
      properties['日付'] = date ? { date: { start: date } } : { date: null };
    }
    if (isReady !== undefined) {
      properties['食材あり'] = { checkbox: isReady };
    }
    if (season !== undefined) {
      properties['季節限定'] = season ? { multi_select: [{ name: season }] } : { multi_select: [] };
    }
    if (Object.keys(properties).length === 0) {
      return res.status(400).json({ error: '更新する項目がありません' });
    }
    try {
      const response = await notion.pages.update({ page_id: id, properties });
      res.json(parseMeal(response));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }

  } else if (req.method === 'DELETE') {
    try {
      await notion.pages.update({ page_id: id, archived: true });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }

  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

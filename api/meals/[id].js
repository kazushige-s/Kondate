const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });

function parseMeal(page) {
  return {
    id: page.id,
    name: page.properties['献立']?.title?.[0]?.plain_text ?? '',
    date: page.properties['日付']?.date?.start ?? '',
    season: page.properties['季節限定']?.select?.name ?? null,
  };
}

module.exports = async function handler(req, res) {
  if (req.method === 'PATCH') {
    const { id } = req.query;
    const { date } = req.body;
    if (!date) return res.status(400).json({ error: '日付は必須です' });
    try {
      const response = await notion.pages.update({
        page_id: id,
        properties: { '日付': { date: { start: date } } },
      });
      res.json(parseMeal(response));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

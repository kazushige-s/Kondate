const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

function parseMeal(page) {
  return {
    id: page.id,
    name: page.properties['献立']?.title?.[0]?.plain_text ?? '',
    date: page.properties['日付']?.date?.start ?? '',
    season: page.properties['季節限定']?.select?.name ?? null,
  };
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const results = [];
      let cursor;
      do {
        const response = await notion.databases.query({
          database_id: DATABASE_ID,
          sorts: [{ property: '日付', direction: 'descending' }],
          start_cursor: cursor,
        });
        results.push(...response.results.map(parseMeal));
        cursor = response.has_more ? response.next_cursor : undefined;
      } while (cursor);
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'POST') {
    const { name, date, season } = req.body;
    if (!name) return res.status(400).json({ error: '献立名は必須です' });
    try {
      const properties = {
        '献立': { title: [{ text: { content: name } }] },
        ...(date ? { '日付': { date: { start: date } } } : {}),
      };
      if (season) properties['季節限定'] = { select: { name: season } };
      const response = await notion.pages.create({
        parent: { database_id: DATABASE_ID },
        properties,
      });
      res.json(parseMeal(response));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

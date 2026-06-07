const express = require('express');
const { Client } = require('@notionhq/client');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

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

app.get('/api/meals', async (req, res) => {
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
});

app.post('/api/meals', async (req, res) => {
  const { name, date, season } = req.body;
  if (!name) {
    return res.status(400).json({ error: '献立名は必須です' });
  }
  try {
    const properties = {
      '献立': { title: [{ text: { content: name } }] },
      ...(date ? { '日付': { date: { start: date } } } : {}),
    };
    if (season) {
      properties['季節限定'] = { select: { name: season } };
    }
    const response = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties,
    });
    res.json(parseMeal(response));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/meals/:id', async (req, res) => {
  const { id } = req.params;
  const { date } = req.body;
  if (!date) return res.status(400).json({ error: '日付は必須です' });
  try {
    const response = await notion.pages.update({
      page_id: id,
      properties: {
        '日付': { date: { start: date } },
      },
    });
    res.json(parseMeal(response));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

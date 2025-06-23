// scraper-service/index.js
const express = require('express');
const { Cluster } = require('puppeteer-cluster');
const bodyParser = require('body-parser');

(async () => {
  // Launch a Puppeteer Cluster with 20 concurrent browsers by default
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 20,
    puppeteerOptions: {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  });

  const app = express();
  app.use(bodyParser.json());
  app.get('/scrape', async (req, res) => {
  const url = "https://google.com"
try {
      const result = await cluster.execute(url, async ({ page, data: selector }) => {
        await page.goto(url, { waitUntil: 'networkidle2' });
        // Extract all matching elements' text
        //const values = await page.$$eval(selector, els => els.map(e => e.textContent.trim()));
        return values;
      }, selector);
      res.json({ values: "tested" });
    } catch (err) {
      console.error('Scrape error', err);
      res.status(500).json({ error: err.message });
    }
  })
  // Endpoint: POST /scrape
  // Accepts { url: string, selector: string }
  app.post('/scrape', async (req, res) => {
    const { url, selector } = req.body;
    if (!url || !selector) {
      return res.status(400).json({ error: 'Missing url or selector' });
    }
    try {
      const result = await cluster.execute(url, async ({ page, data: selector }) => {
        await page.goto(url, { waitUntil: 'networkidle2' });
        // Extract all matching elements' text
        const values = await page.$$eval(selector, els => els.map(e => e.textContent.trim()));
        return values;
      }, selector);
      res.json({ values: result });
    } catch (err) {
      console.error('Scrape error', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Start Express server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Scraper service running on port ${PORT}`));
})();


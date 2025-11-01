import * as fs from 'fs/promises';
import * as path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port: string | number = process.env.PORT || 80;
const apiUrl: string = process.env.BASE_API_URL || '';

app.get('/', async (_req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  try {
    const html = await fs.readFile(indexPath, 'utf8');
    // Inject the API URL as a global variable
    const injectedHtml = html.replace(/<head>/, `<head><script>window.__BASE_API_URL__ = "${apiUrl}";</script>`);
    res.send(injectedHtml);
  } catch (err) {
    res.status(500).send('Error loading file');
  }
});

// Serve static files from dist
app.use(express.static(path.join(__dirname, 'dist')));

// Catch all handler: send back index.html for SPA routing
app.get('*', async (_req, res) => {
  const indexHtmlPath = path.join(__dirname, 'dist', 'index.html');
  try {
    const html = await fs.readFile(indexHtmlPath, 'utf8');
    const injectedHtml = html.replace(/<head>/, `<head><script>window.__BASE_API_URL__ = "${apiUrl}";</script>`);
    res.send(injectedHtml);
  } catch (err) {
    res.status(500).send('Error loading file');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

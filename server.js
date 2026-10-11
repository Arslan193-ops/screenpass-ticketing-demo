const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4300;
const PUBLIC_DIR = path.join(__dirname, 'public');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

function serveStatic(req, res) {
  const filePath = path.join(PUBLIC_DIR, req.url === '/' ? '/index.html' : req.url);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'text/plain' });
    res.end(data);
  });
}

async function proxy(req, res) {
  const baseUrl = req.headers['x-demo-base-url'];
  const apiKey = req.headers['x-demo-api-key'];
  if (!baseUrl || !apiKey) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Missing API base URL or API key — set them in Settings first.' }));
    return;
  }

  const targetPath = req.url.replace(/^\/api\/proxy/, '/api/partner/v1');
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;

  try {
    const upstream = await fetch(baseUrl.replace(/\/$/, '') + targetPath, {
      method: req.method,
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': apiKey },
      body,
    });
    const text = await upstream.text();
    res.writeHead(upstream.status, { 'Content-Type': 'application/json' });
    res.end(text);
  } catch (err) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Could not reach Cinema API: ' + err.message }));
  }
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/proxy/')) proxy(req, res);
  else serveStatic(req, res);
});

server.listen(PORT, () => console.log(`Ticket demo running at http://localhost:${PORT}`));

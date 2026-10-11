module.exports = async function handler(req, res) {
  const baseUrl = req.headers['x-demo-base-url'];
  const apiKey = req.headers['x-demo-api-key'];
  if (!baseUrl || !apiKey) {
    res.status(400).json({ success: false, message: 'Missing API base URL or API key — set them in Settings first.' });
    return;
  }

  const segments = Array.isArray(req.query.path) ? req.query.path : [];
  const targetPath = '/api/partner/v1/' + segments.join('/');
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';

  try {
    const upstream = await fetch(baseUrl.replace(/\/$/, '') + targetPath, {
      method: req.method,
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': apiKey },
      body: hasBody ? JSON.stringify(req.body) : undefined,
    });
    const text = await upstream.text();
    res.status(upstream.status).setHeader('Content-Type', 'application/json').send(text);
  } catch (err) {
    res.status(502).json({ success: false, message: 'Could not reach Cinema API: ' + err.message });
  }
};

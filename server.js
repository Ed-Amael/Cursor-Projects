const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 8080;

app.disable('x-powered-by');
app.use(morgan('tiny'));
app.use(compression());
app.use(express.json({ limit: '200kb' }));

// Security headers (relaxed CSP for external assets in this demo)
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "base-uri": ["'self'"],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
      "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      "img-src": ["'self'", "data:", "https:", "blob:"],
      "script-src": ["'self'", "'unsafe-inline'"],
      "connect-src": [
        "'self'",
        "https://speed.cloudflare.com",
        "https://1.1.1.1"
      ],
      "frame-src": ["'self'", "https://www.openstreetmap.org"],
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Minimal APIs
app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ ok: false, error: 'Missing fields' });
  console.log('[CONTACT]', { name, email, len: message.length });
  res.json({ ok: true });
});

// Static files
const publicRoot = path.resolve(__dirname);
app.use(express.static(publicRoot, { maxAge: '1h', extensions: ['html'] }));

// Fallback to index for unknown routes only if file not found
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  const file = path.join(publicRoot, req.path);
  if (path.extname(file)) return next();
  res.sendFile(path.join(publicRoot, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
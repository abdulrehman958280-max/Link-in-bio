const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Explicit MIME type and static file handler
app.use(express.static(path.join(__dirname), {
  dotfiles: 'ignore',
  etag: true,
  extensions: ['html', 'htm'],
  index: ['index.html'],
  maxAge: '1d',
  redirect: false,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Accept-Ranges', 'bytes');
    }
  }
}));

// Route fallback for client-side pages, preventing static file 404s from returning HTML
app.get('*', (req, res) => {
  if (/\.(css|js|png|jpg|jpeg|gif|svg|mp4|webm|otf|ttf|woff2|ico)$/i.test(req.path)) {
    return res.status(404).send('Asset not found');
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Run server only when executed directly (standalone / Cloud Run)
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

// Export for serverless runtime (Vercel Node.js Serverless Functions)
module.exports = app;


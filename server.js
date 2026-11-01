/**
 * Wish Yours — Production Web & API Server
 * Zero-dependency, ultra-fast Node.js server with Open Graph tag injection.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Load environment variables from .env.local and .env files safely
(function loadEnv() {
  const envFiles = [
    path.join(__dirname, '.env.local'),
    path.join(__dirname, '.env')
  ];

  envFiles.forEach(envPath => {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf-8');
        content.split(/\r?\n/).forEach(line => {
          // Ignore comments and empty lines
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) return;

          const match = trimmed.match(/^([\w.-]+)\s*=\s*(.*)?$/);
          if (match) {
            const key = match[1];
            let value = match[2] || '';
            // Remove inline comments if not quoted
            if ((!value.startsWith('"') && !value.startsWith("'")) && value.includes('#')) {
              value = value.split('#')[0].trim();
            }
            // Strip surrounding quotes
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            value = value.trim();

            // Only set if non-empty or if process.env[key] is not already set by host/Render
            if (value.length > 0 || process.env[key] === undefined) {
              // Priority: existing process.env (e.g. from Render dashboard) > .env.local > .env
              if (!process.env[key] || process.env[key].length === 0) {
                process.env[key] = value;
              }
            }
          }
        });
      } catch (err) {
        console.warn(`[Env Warning] Could not parse ${envPath}:`, err.message);
      }
    }
  });
})();

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Import API handlers
const db = require('./data/db');
const { handleGenerateMessage } = require('./api/generate-message');
const {
  handleGetWish,
  handleListWishes,
  handleCreateWish,
  handleUpdateWish,
  handleDeleteWish,
  handleBlowCandles
} = require('./api/wishes');
const { handleSendEmail } = require('./api/email');
const { handlePrepareSMS } = require('./api/sms');
const { handleGetVisualAssets } = require('./api/generate-image');
const { handleGetAdminStats, handleModerateWish } = require('./api/admin');
const {
  handleCreateScheduledWish,
  handleListScheduledWishes,
  handleGetScheduledWish,
  handleUpdateScheduledWish,
  handleCancelScheduledWish,
  handleDeleteScheduledWish,
  handleTriggerCron
} = require('./api/scheduled');
const { startSchedulerLoop } = require('./scheduler/engine');

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav'
};

// Helper to parse JSON request body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      // Guard against payloads larger than 10MB (photo uploads)
      if (body.length > 10 * 1024 * 1024) {
        reject({ statusCode: 413, message: 'Payload too large (10MB limit)' });
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject({ statusCode: 400, message: 'Invalid JSON payload' });
      }
    });
    req.on('error', reject);
  });
}

// Helper to send JSON responses
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-key'
  });
  res.end(JSON.stringify(data));
}

// Helper to serve static files
function serveStaticFile(req, res, filePath, contentType) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('404 Not Found');
      }
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      return res.end(`Server Error: ${err.code}`);
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': filePath.endsWith('.html') ? 'no-cache' : 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN'
    });
    res.end(content);
  });
}

// Inject Open Graph tags dynamically into wish.html for rich social previews
function serveWishPageWithOpenGraph(res, slug) {
  const wishHtmlPath = path.join(__dirname, 'public', 'wish.html');
  fs.readFile(wishHtmlPath, 'utf-8', (err, html) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      return res.end('Error loading greeting page template');
    }

    const wish = db.getWishBySlug(slug);
    if (!wish) {
      // Still serve wish.html; the client side JS will render the 404 message state
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    }

    // Compose custom social tags
    const title = `✨ A Heartfelt ${wish.occasion} Wish for ${wish.recipient_name}!`;
    const description = wish.message ? wish.message.slice(0, 150) + '...' : `A personalized interactive digital greeting sent with love by ${wish.sender_name}.`;
    const pageUrl = `${BASE_URL}/wish/${wish.slug}`;
    const previewImage = wish.images?.[0]?.url || `${BASE_URL}/assets/og-preview.png`;

    const ogTags = `
    <!-- Dynamic Open Graph & Twitter Cards -->
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${previewImage}">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${previewImage}">
    `;

    const injectedHtml = html.replace('<!-- INJECT_OG_TAGS -->', ogTags);

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache'
    });
    res.end(injectedHtml);
  });
}

// Master HTTP Request Handler
async function requestHandler(req, res) {
  const host = req.headers.host || `localhost:${PORT}`;
  const parsedUrl = new URL(req.url, `http://${host}`);
  const pathname = parsedUrl.pathname;
  const queryParams = Object.fromEntries(parsedUrl.searchParams.entries());
  const method = req.method.toUpperCase();

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-key'
    });
    return res.end();
  }

  try {
    // ==========================================
    // 1. API ROUTES
    // ==========================================

    // Health check
    if (pathname === '/health' && method === 'GET') {
      return sendJSON(res, 200, {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        ai_provider: process.env.GEMINI_API_KEY ? 'gemini-active' : 'template-synthesizer-active'
      });
    }

    // AI Message Generation
    if (pathname === '/api/generate-message' && method === 'POST') {
      const body = await parseBody(req);
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const result = await handleGenerateMessage(body, clientIp);
      return sendJSON(res, 200, result);
    }

    // Wishes CRUD
    if (pathname === '/api/wishes' && method === 'GET') {
      const result = await handleListWishes(queryParams);
      return sendJSON(res, 200, result);
    }

    if (pathname === '/api/wishes' && method === 'POST') {
      const body = await parseBody(req);
      const result = await handleCreateWish(body);
      return sendJSON(res, 201, result);
    }

    // Specific wish endpoints: /api/wishes/:slug
    const wishMatch = pathname.match(/^\/api\/wishes\/([^/]+)\/?$/);
    if (wishMatch) {
      const slug = decodeURIComponent(wishMatch[1]);

      if (method === 'GET') {
        const result = await handleGetWish(slug, req);
        return sendJSON(res, 200, result);
      }
      if (method === 'PUT') {
        const body = await parseBody(req);
        const result = await handleUpdateWish(slug, body);
        return sendJSON(res, 200, result);
      }
      if (method === 'DELETE') {
        const result = await handleDeleteWish(slug);
        return sendJSON(res, 200, result);
      }
    }

    // Candle blow-out interaction: /api/wishes/:slug/candles
    const candleMatch = pathname.match(/^\/api\/wishes\/([^/]+)\/candles\/?$/);
    if (candleMatch && method === 'POST') {
      const slug = decodeURIComponent(candleMatch[1]);
      const body = await parseBody(req);
      const result = await handleBlowCandles(slug, body.candles_blown !== false);
      return sendJSON(res, 200, result);
    }

    // Email delivery
    if (pathname === '/api/share/email' && method === 'POST') {
      const body = await parseBody(req);
      const result = await handleSendEmail(body, BASE_URL);
      return sendJSON(res, 200, result);
    }

    // SMS helper
    if (pathname === '/api/share/sms' && method === 'POST') {
      const body = await parseBody(req);
      const result = await handlePrepareSMS(body, BASE_URL);
      return sendJSON(res, 200, result);
    }

    // Templates list
    if (pathname === '/api/templates' && method === 'GET') {
      const templates = db.listTemplates();
      return sendJSON(res, 200, { status: 'success', templates });
    }

    // Visual assets & presets
    if (pathname === '/api/visual-assets' && method === 'GET') {
      const assets = await handleGetVisualAssets(queryParams);
      return sendJSON(res, 200, assets);
    }

    // Admin Analytics & Moderation
    if (pathname === '/api/admin/stats' && method === 'GET') {
      const stats = await handleGetAdminStats(req.headers);
      return sendJSON(res, 200, stats);
    }

    if (pathname === '/api/admin/moderate' && method === 'POST') {
      const body = await parseBody(req);
      const result = await handleModerateWish(body, req.headers);
      return sendJSON(res, 200, result);
    }

    // ==========================================
    // SCHEDULED WISHES API ROUTES
    // ==========================================
    if (pathname === '/api/scheduled-wishes' && method === 'GET') {
      const result = await handleListScheduledWishes(queryParams);
      return sendJSON(res, 200, result);
    }

    if (pathname === '/api/scheduled-wishes' && method === 'POST') {
      const body = await parseBody(req);
      const result = await handleCreateScheduledWish(body);
      return sendJSON(res, 201, result);
    }

    const schedMatch = pathname.match(/^\/api\/scheduled-wishes\/([^/]+)\/?$/);
    if (schedMatch) {
      const schedId = decodeURIComponent(schedMatch[1]);
      if (method === 'GET') {
        const result = await handleGetScheduledWish(schedId);
        return sendJSON(res, 200, result);
      }
      if (method === 'PUT') {
        const body = await parseBody(req);
        const result = await handleUpdateScheduledWish(schedId, body);
        return sendJSON(res, 200, result);
      }
      if (method === 'DELETE') {
        const result = await handleDeleteScheduledWish(schedId);
        return sendJSON(res, 200, result);
      }
    }

    const cancelMatch = pathname.match(/^\/api\/scheduled-wishes\/([^/]+)\/cancel\/?$/);
    if (cancelMatch && method === 'POST') {
      const schedId = decodeURIComponent(cancelMatch[1]);
      const result = await handleCancelScheduledWish(schedId);
      return sendJSON(res, 200, result);
    }

    // Cron Trigger Endpoint (can be invoked by external cron service e.g. cron-job.org)
    if (pathname === '/api/cron/process-scheduled' && method === 'POST') {
      const result = await handleTriggerCron(req.headers, BASE_URL);
      return sendJSON(res, 200, result);
    }

    // ==========================================
    // 2. PAGE ROUTING & DYNAMIC PREVIEWS
    // ==========================================

    // Dynamic greeting page: /wish/:slug
    const pageWishMatch = pathname.match(/^\/wish\/([^/]+)\/?$/);
    if (pageWishMatch && method === 'GET') {
      const slug = decodeURIComponent(pageWishMatch[1]);
      return serveWishPageWithOpenGraph(res, slug);
    }

    if (pathname === '/create' && method === 'GET') {
      return serveStaticFile(req, res, path.join(__dirname, 'public', 'create.html'), 'text/html; charset=utf-8');
    }

    if (pathname === '/dashboard' && method === 'GET') {
      return serveStaticFile(req, res, path.join(__dirname, 'public', 'dashboard.html'), 'text/html; charset=utf-8');
    }

    if (pathname === '/admin' && method === 'GET') {
      return serveStaticFile(req, res, path.join(__dirname, 'public', 'admin.html'), 'text/html; charset=utf-8');
    }

    if ((pathname === '/' || pathname === '/index.html') && method === 'GET') {
      return serveStaticFile(req, res, path.join(__dirname, 'public', 'index.html'), 'text/html; charset=utf-8');
    }

    // ==========================================
    // 3. STATIC FILE SERVING
    // ==========================================
    const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
    const publicFilePath = path.join(__dirname, 'public', safePath);

    if (fs.existsSync(publicFilePath) && fs.statSync(publicFilePath).isFile()) {
      const ext = path.extname(publicFilePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      return serveStaticFile(req, res, publicFilePath, contentType);
    }

    // 404 for unknown endpoints
    if (pathname.startsWith('/api/')) {
      return sendJSON(res, 404, { status: 'error', message: 'API route not found' });
    }

    // Fallback to 404 page or index
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>404 - Page Not Found | Wish Yours</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      </head>
      <body class="bg-gray-950 text-white min-h-screen flex items-center justify-center p-6 text-center">
        <div class="max-w-md">
          <div class="text-6xl mb-4">✨🎂</div>
          <h1 class="text-3xl font-bold mb-2">Greeting Not Found</h1>
          <p class="text-gray-400 mb-6">The celebration page you are looking for might have been moved or expired.</p>
          <a href="/" class="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl font-bold hover:opacity-90 inline-block">Return Home</a>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('Server request error:', error);
    const code = error.statusCode || 500;
    return sendJSON(res, code, {
      status: 'error',
      message: error.message || 'Internal Server Error'
    });
  }
}

// Create and export server for programmatic testing or standalone execution
const server = http.createServer(requestHandler);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`✨ Wish Yours Server running at http://localhost:${PORT}`);
    console.log(`   Occasions: Birthday, Anniversary, Friendship, Romantic`);
    console.log(`   AI Integration: Google Gemini (${process.env.GEMINI_API_KEY ? 'API Key Active' : 'Fallback Synthesizer Active'})`);
    console.log(`======================================================\n`);
  });
}

module.exports = {
  server,
  requestHandler
};

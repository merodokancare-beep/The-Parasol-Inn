import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Import API route handlers
import roomsHandler from './api/rooms.js';
import galleryHandler from './api/gallery.js';
import attractionsHandler from './api/attractions.js';
import testimonialsHandler from './api/testimonials.js';
import settingsHandler from './api/settings.js';
import enquiriesHandler from './api/enquiries.js';
import authHandler from './api/auth.js';
import backupHandler from './api/backup.js';
import dbInitHandler from './api/db-init.js';
import teamHandler from './api/team.js';
import uploadHandler from './api/upload.js';
import fs from 'fs';

import { ensureTablesExist } from './api/_db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
const uploadsVideosDir = path.join(__dirname, 'uploads', 'videos');
if (!fs.existsSync(uploadsVideosDir)) {
  fs.mkdirSync(uploadsVideosDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Parsing Middlewares
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Lightweight In-Memory API Cache (60s TTL for public GET operations)
const apiCache = new Map();
const CACHE_TTL_MS = 60 * 1000;

function cachedRoute(handler, routeName) {
  return async (req, res) => {
    const isAdminAuth = Boolean(req.headers.authorization || req.query.passcode);
    if (req.method === 'GET' && !req.query.nocache && !isAdminAuth) {
      const hit = apiCache.get(routeName);
      if (hit && (Date.now() - hit.time < CACHE_TTL_MS)) {
        return res.status(200).json(hit.data);
      }
      const origJson = res.json.bind(res);
      res.json = (data) => {
        if (res.statusCode === 200 && data && !data.error) {
          apiCache.set(routeName, { time: Date.now(), data });
        }
        return origJson(data);
      };
      return handler(req, res);
    }
    if (req.method !== 'GET') {
      apiCache.delete(routeName);
    }
    return handler(req, res);
  };
}

// API Routes (adapts Vercel serverless format for Express with caching)
app.all('/api/rooms', cachedRoute((req, res) => roomsHandler(req, res), 'rooms'));
app.all('/api/gallery', cachedRoute((req, res) => galleryHandler(req, res), 'gallery'));
app.all('/api/attractions', cachedRoute((req, res) => attractionsHandler(req, res), 'attractions'));
app.all('/api/testimonials', cachedRoute((req, res) => testimonialsHandler(req, res), 'testimonials'));
app.all('/api/settings', cachedRoute((req, res) => settingsHandler(req, res), 'settings'));
app.all('/api/team', cachedRoute((req, res) => teamHandler(req, res), 'team'));
app.all('/api/enquiries', (req, res) => enquiriesHandler(req, res));
app.all('/api/auth', (req, res) => authHandler(req, res));
app.all('/api/upload', (req, res) => uploadHandler(req, res));
app.all('/api/backup', (req, res) => backupHandler(req, res));
app.all('/api/db-init', (req, res) => {
  apiCache.clear();
  return dbInitHandler(req, res);
});

// Explicit static serving for uploaded videos/media
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static assets with no-cache for HTML, CSS, and JS so updates reflect immediately
app.use(express.static(__dirname, {
  extensions: ['html'],
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.css') || filePath.endsWith('.js')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// Clean URLs fallback (e.g. /rooms -> rooms.html)
app.get('*', (req, res) => {
  // If request contains an extension (e.g. .css, .js, .png) and wasn't caught by static middleware, return 404
  if (path.extname(req.path)) {
    return res.status(404).send('Not Found');
  }

  const cleanName = req.path.replace(/^\//, '');
  const candidate = path.join(__dirname, cleanName ? `${cleanName}.html` : 'index.html');

  res.sendFile(candidate, (err) => {
    if (err) {
      res.sendFile(path.join(__dirname, 'index.html'));
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  ensureTablesExist().catch(err => console.warn('DB initialization check:', err.message));
  console.log(`===============================================`);
  console.log(`  The Parasol Inn Server is Live!              `);
  console.log(`  URL: http://localhost:${PORT}                `);
  console.log(`  Port: ${PORT}                                `);
  console.log(`  Database URL: ${process.env.DATABASE_URL ? 'Configured' : 'NOT SET'}`);
  console.log(`===============================================`);
});

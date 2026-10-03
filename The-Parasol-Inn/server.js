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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Parsing Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes (adapts Vercel serverless format for Express)
app.all('/api/rooms', (req, res) => roomsHandler(req, res));
app.all('/api/gallery', (req, res) => galleryHandler(req, res));
app.all('/api/attractions', (req, res) => attractionsHandler(req, res));
app.all('/api/testimonials', (req, res) => testimonialsHandler(req, res));
app.all('/api/settings', (req, res) => settingsHandler(req, res));
app.all('/api/enquiries', (req, res) => enquiriesHandler(req, res));
app.all('/api/auth', (req, res) => authHandler(req, res));
app.all('/api/backup', (req, res) => backupHandler(req, res));
app.all('/api/db-init', (req, res) => dbInitHandler(req, res));
app.all('/api/team', (req, res) => teamHandler(req, res));

// Serve static assets from current directory (css, js, images, html)
app.use(express.static(__dirname, { extensions: ['html'] }));

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
  console.log(`===============================================`);
  console.log(`  The Parasol Inn Server is Live!              `);
  console.log(`  URL: http://localhost:${PORT}                `);
  console.log(`  Port: ${PORT}                                `);
  console.log(`  Database URL: ${process.env.DATABASE_URL ? 'Configured' : 'NOT SET'}`);
  console.log(`===============================================`);
});

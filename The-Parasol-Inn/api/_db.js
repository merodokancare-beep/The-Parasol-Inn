import { neon } from '@neondatabase/serverless';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables for local development
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("CRITICAL: DATABASE_URL environment variable is missing.");
}

function initSql(url) {
  if (!url) return null;
  // If connection is neon.tech, use neon HTTP client
  if (url.includes('neon.tech')) {
    return neon(url);
  }
  // Otherwise use native PostgreSQL connection for local or self-hosted PostgreSQL
  return postgres(url, { max: 10, connect_timeout: 10 });
}

// Export the SQL query executor
export const sql = initSql(databaseUrl);

/**
 * Verify if the request is authenticated as admin
 * @param {Request} req - The Vercel request object
 * @returns {Promise<boolean>} - True if authenticated, false otherwise
 */
export async function verifyAdmin(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader) return false;

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;

  const enteredPasscode = match[1];

  if (!sql) {
    return enteredPasscode === 'admin123';
  }

  try {
    // Get the passcode from settings table
    const result = await sql`SELECT passcode FROM settings WHERE id = 'global'`;
    if (result.length === 0) {
      // Default passcode if settings doesn't exist yet
      return enteredPasscode === 'admin123';
    }
    return result[0].passcode === enteredPasscode;
  } catch (error) {
    // If database tables are not yet created, allow fallback to admin123
    if (error.code === '42P01' || (error.message && error.message.includes('relation "settings" does not exist'))) {
      return enteredPasscode === 'admin123';
    }
    console.error("Authentication check failed:", error);
    return false;
  }
}

/**
 * Ensure all resort database tables are created in Neon
 */
export async function ensureTablesExist() {
  if (!sql) return;

  await sql`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tagline TEXT,
      description TEXT,
      price INTEGER NOT NULL,
      image TEXT,
      amenities TEXT[] DEFAULT '{}',
      inventory INTEGER DEFAULT 5
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS gallery (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      image TEXT NOT NULL,
      title TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS attractions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      distance TEXT,
      drive_time TEXT,
      image TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY,
      quote TEXT NOT NULL,
      author TEXT NOT NULL,
      location TEXT,
      avatar TEXT,
      rating INTEGER DEFAULT 5,
      status TEXT DEFAULT 'approved',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      phone_front_desk TEXT,
      phone_reservations TEXT,
      email_info TEXT,
      email_booking TEXT,
      whatsapp TEXT,
      address TEXT,
      passcode TEXT DEFAULT 'admin123',
      testimonials_title TEXT,
      testimonials_subtitle TEXT,
      about_hero_title TEXT,
      about_hero_subtitle TEXT,
      about_hero_image TEXT,
      about_badge TEXT,
      about_heading TEXT,
      about_story_p1 TEXT,
      about_story_p2 TEXT,
      about_story_p3 TEXT,
      about_img_1 TEXT,
      about_img_2 TEXT,
      about_vision TEXT,
      about_mission TEXT,
      about_timeline_subtitle TEXT,
      about_timeline_title TEXT,
      about_timeline JSONB,
      about_team_subtitle TEXT,
      about_team_title TEXT
    )
  `;

  try {
    await sql`ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 5`;
    await sql`ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved'`;
    await sql`ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
    await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS testimonials_title TEXT`;
    await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS testimonials_subtitle TEXT`;
    await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_hero_title TEXT`;
    await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_hero_subtitle TEXT`;
    await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_hero_image TEXT`;
    await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_badge TEXT`;
    await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_heading TEXT`;
    await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_story_p1 TEXT`;
    await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_story_p2 TEXT`;
    await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_story_p3 TEXT`;
    await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_img_1 TEXT`;
    await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_img_2 TEXT`;
    await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_vision TEXT`;
    await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_mission TEXT`;
    await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_timeline_subtitle TEXT`;
    await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_timeline_title TEXT`;
    await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_timeline JSONB`;
    await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_team_subtitle TEXT`;
    await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_team_title TEXT`;
  } catch (err) {
    console.warn('Column migration note:', err.message);
  }

  await sql`
    CREATE TABLE IF NOT EXISTS enquiries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      checkin TEXT NOT NULL,
      checkout TEXT NOT NULL,
      guests INTEGER NOT NULL,
      room_type_name TEXT NOT NULL,
      room_type_id TEXT NOT NULL,
      message TEXT,
      cost INTEGER NOT NULL,
      status TEXT DEFAULT 'Pending',
      source TEXT DEFAULT 'Online',
      date TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS team (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      bio TEXT,
      image TEXT,
      display_order INTEGER DEFAULT 0
    )
  `;
}


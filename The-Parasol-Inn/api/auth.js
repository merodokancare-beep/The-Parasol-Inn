import { sql } from './_db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(455).json({ error: 'Method Not Allowed. Use POST.' });
  }

  if (!sql) {
    return res.status(500).json({ error: 'Database connection offline.' });
  }

  const { passcode } = req.body || {};

  if (!passcode) {
    return res.status(400).json({ error: 'Passcode is required.' });
  }

  try {
    const result = await sql`SELECT passcode FROM settings WHERE id = 'global'`;
    const dbPasscode = result.length > 0 ? result[0].passcode : 'admin123';

    if (passcode === dbPasscode) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(401).json({ success: false, error: 'Invalid passcode.' });
    }
  } catch (error) {
    // If the database has not been initialized (relation does not exist)
    if (error.code === '42P01' || (error.message && error.message.includes('relation "settings" does not exist'))) {
      if (passcode === 'admin123') {
        return res.status(200).json({ success: true });
      } else {
        return res.status(401).json({ success: false, error: 'Invalid passcode.' });
      }
    }
    console.error('Authentication error:', error);
    return res.status(500).json({ error: error.message });
  }
}

import { sql, verifyAdmin } from './_db.js';
import { DEFAULT_TEAM } from './_seeds.js';

let memoryTeam = [...DEFAULT_TEAM];

async function ensureTeamTable() {
  if (!sql) return;
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

export default async function handler(req, res) {
  const { method } = req;

  // Offline fallback if database is not connected
  if (!sql) {
    if (method === 'GET') {
      return res.status(200).json(memoryTeam);
    }

    const isAuthorized = await verifyAdmin(req);
    if (!isAuthorized) {
      return res.status(401).json({ error: 'Unauthorized admin access.' });
    }

    if (method === 'POST') {
      const { id, name, role, bio, image, display_order } = req.body || {};
      if (!id || !name || !role) {
        return res.status(400).json({ error: 'ID, Name, and Role are required.' });
      }

      const existIdx = memoryTeam.findIndex(m => m.id === id);
      const member = {
        id,
        name,
        role,
        bio: bio || '',
        image: image || '',
        display_order: parseInt(display_order) || 0
      };

      if (existIdx >= 0) {
        memoryTeam[existIdx] = member;
      } else {
        memoryTeam.push(member);
      }
      memoryTeam.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

      return res.status(200).json({ success: true, offline: true, message: 'Team member saved successfully.' });
    }

    if (method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Member ID is required.' });
      }
      memoryTeam = memoryTeam.filter(m => m.id !== id);
      return res.status(200).json({ success: true, offline: true, message: 'Team member deleted successfully.' });
    }

    return res.status(405).json({ error: 'Method Not Allowed.' });
  }

  try {
    await ensureTeamTable();
  } catch (tableErr) {
    console.error('Error ensuring team table:', tableErr);
  }

  if (method === 'GET') {
    try {
      let team = await sql`SELECT * FROM team ORDER BY display_order ASC, name ASC`;
      if (team.length === 0 && DEFAULT_TEAM.length > 0) {
        for (const m of DEFAULT_TEAM) {
          await sql`
            INSERT INTO team (id, name, role, bio, image, display_order)
            VALUES (${m.id}, ${m.name}, ${m.role}, ${m.bio || ''}, ${m.image || ''}, ${m.display_order || 0})
            ON CONFLICT (id) DO NOTHING
          `;
        }
        team = await sql`SELECT * FROM team ORDER BY display_order ASC, name ASC`;
      }
      return res.status(200).json(team);
    } catch (error) {
      console.error('Error fetching team members:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Admin authorization check for mutating requests (POST, DELETE)
  const isAuthorized = await verifyAdmin(req);
  if (!isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized admin access.' });
  }

  if (method === 'POST') {
    const { id, name, role, bio, image, display_order } = req.body || {};
    if (!id || !name || !role) {
      return res.status(400).json({ error: 'ID, Name, and Role are required.' });
    }

    try {
      await sql`
        INSERT INTO team (id, name, role, bio, image, display_order)
        VALUES (${id}, ${name}, ${role}, ${bio || ''}, ${image || ''}, ${parseInt(display_order) || 0})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          bio = EXCLUDED.bio,
          image = EXCLUDED.image,
          display_order = EXCLUDED.display_order
      `;
      return res.status(200).json({ success: true, message: 'Team member saved successfully.' });
    } catch (error) {
      console.error('Error saving team member:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (method === 'DELETE') {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Member ID is required.' });
    }

    try {
      await sql`DELETE FROM team WHERE id = ${id}`;
      return res.status(200).json({ success: true, message: 'Team member deleted successfully.' });
    } catch (error) {
      console.error('Error deleting team member:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(455).json({ error: 'Method Not Allowed.' });
}

import { sql, verifyAdmin } from './_db.js';

export default async function handler(req, res) {
  if (!sql) {
    return res.status(500).json({ error: 'Database connection offline.' });
  }

  const { method } = req;

  if (method === 'GET') {
    try {
      const team = await sql`SELECT * FROM team ORDER BY display_order ASC, name ASC`;
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

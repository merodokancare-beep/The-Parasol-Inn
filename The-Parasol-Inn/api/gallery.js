import { sql, verifyAdmin } from './_db.js';

export default async function handler(req, res) {
  if (!sql) {
    return res.status(500).json({ error: 'Database connection offline.' });
  }

  const { method } = req;

  if (method === 'GET') {
    try {
      const gallery = await sql`SELECT * FROM gallery`;
      return res.status(200).json(gallery);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Admin authorization check for mutating requests (POST, DELETE)
  const isAuthorized = await verifyAdmin(req);
  if (!isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized admin access.' });
  }

  if (method === 'POST') {
    const { id, category, image, title } = req.body || {};
    if (!id || !category || !image) {
      return res.status(400).json({ error: 'ID, category, and image are required.' });
    }

    try {
      await sql`
        INSERT INTO gallery (id, category, image, title)
        VALUES (${id}, ${category}, ${image}, ${title || ''})
        ON CONFLICT (id) DO UPDATE SET
          category = EXCLUDED.category,
          image = EXCLUDED.image,
          title = EXCLUDED.title
      `;
      return res.status(200).json({ success: true, message: 'Gallery item saved successfully.' });
    } catch (error) {
      console.error('Error saving gallery item:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (method === 'DELETE') {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Gallery item ID is required.' });
    }

    try {
      await sql`DELETE FROM gallery WHERE id = ${id}`;
      return res.status(200).json({ success: true, message: 'Gallery item deleted successfully.' });
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(455).json({ error: 'Method Not Allowed.' });
}

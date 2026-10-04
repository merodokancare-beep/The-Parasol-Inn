import { sql, verifyAdmin } from './_db.js';
import { DEFAULT_GALLERY } from './_seeds.js';

let memoryGallery = [...DEFAULT_GALLERY];

export default async function handler(req, res) {
  const { method } = req;

  if (!sql) {
    if (method === 'GET') {
      return res.status(200).json(memoryGallery);
    }

    const isAuthorized = await verifyAdmin(req);
    if (!isAuthorized) {
      return res.status(401).json({ error: 'Unauthorized admin access.' });
    }

    if (method === 'POST') {
      const { id, category, image, title } = req.body || {};
      if (!id || !category || !image) {
        return res.status(400).json({ error: 'ID, category, and image are required.' });
      }

      const existIdx = memoryGallery.findIndex(g => g.id === id);
      const item = {
        id,
        category,
        image,
        title: title || ''
      };

      if (existIdx >= 0) {
        memoryGallery[existIdx] = item;
      } else {
        memoryGallery.push(item);
      }
      return res.status(200).json({ success: true, offline: true, message: 'Gallery item saved successfully.' });
    }

    if (method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Gallery item ID is required.' });
      memoryGallery = memoryGallery.filter(g => g.id !== id);
      return res.status(200).json({ success: true, offline: true, message: 'Gallery item deleted successfully.' });
    }

    return res.status(405).json({ error: 'Method Not Allowed.' });
  }

  // Database is connected
  if (method === 'GET') {
    try {
      const rows = await sql`SELECT * FROM gallery`;
      if (!rows || rows.length === 0) {
        return res.status(200).json(DEFAULT_GALLERY);
      }
      return res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      return res.status(200).json(DEFAULT_GALLERY);
    }
  }

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

  return res.status(405).json({ error: 'Method Not Allowed.' });
}

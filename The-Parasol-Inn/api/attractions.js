import { sql, verifyAdmin } from './_db.js';
import { DEFAULT_ATTRACTIONS } from './_seeds.js';

let memoryAttractions = [...DEFAULT_ATTRACTIONS];

export default async function handler(req, res) {
  const { method } = req;

  if (!sql) {
    if (method === 'GET') {
      return res.status(200).json(memoryAttractions);
    }

    const isAuthorized = await verifyAdmin(req);
    if (!isAuthorized) {
      return res.status(401).json({ error: 'Unauthorized admin access.' });
    }

    if (method === 'POST') {
      const { id, name, description, distance, driveTime, image } = req.body || {};
      if (!id || !name || !image) {
        return res.status(400).json({ error: 'ID, Name, and Image are required.' });
      }

      const existIdx = memoryAttractions.findIndex(a => a.id === id);
      const item = {
        id,
        name,
        description: description || '',
        distance: distance || '',
        driveTime: driveTime || '',
        image
      };

      if (existIdx >= 0) {
        memoryAttractions[existIdx] = item;
      } else {
        memoryAttractions.push(item);
      }
      return res.status(200).json({ success: true, offline: true, message: 'Attraction saved successfully.' });
    }

    if (method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Attraction ID is required.' });
      memoryAttractions = memoryAttractions.filter(a => a.id !== id);
      return res.status(200).json({ success: true, offline: true, message: 'Attraction deleted successfully.' });
    }

    return res.status(405).json({ error: 'Method Not Allowed.' });
  }

  if (method === 'POST') {
    const { id, name, description, distance, driveTime, image } = req.body || {};
    if (!id || !name || !image) {
      return res.status(400).json({ error: 'ID, Name, and Image are required.' });
    }

    try {
      await sql`
        INSERT INTO attractions (id, name, description, distance, drive_time, image)
        VALUES (${id}, ${name}, ${description}, ${distance}, ${driveTime}, ${image})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          distance = EXCLUDED.distance,
          drive_time = EXCLUDED.drive_time,
          image = EXCLUDED.image
      `;
      return res.status(200).json({ success: true, message: 'Attraction saved successfully.' });
    } catch (error) {
      console.error('Error saving attraction:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (method === 'DELETE') {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Attraction ID is required.' });
    }

    try {
      await sql`DELETE FROM attractions WHERE id = ${id}`;
      return res.status(200).json({ success: true, message: 'Attraction deleted successfully.' });
    } catch (error) {
      console.error('Error deleting attraction:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(455).json({ error: 'Method Not Allowed.' });
}

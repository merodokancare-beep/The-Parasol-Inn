import { sql, verifyAdmin } from './_db.js';
import { DEFAULT_ROOMS } from './_seeds.js';

let memoryRooms = [...DEFAULT_ROOMS];

export default async function handler(req, res) {
  const { method } = req;

  if (!sql) {
    if (method === 'GET') {
      return res.status(200).json(memoryRooms);
    }

    const isAuthorized = await verifyAdmin(req);
    if (!isAuthorized) {
      return res.status(401).json({ error: 'Unauthorized admin access.' });
    }

    if (method === 'POST') {
      const { id, name, tagline, description, price, image, amenities, inventory } = req.body || {};
      if (!id || !name || price === undefined) {
        return res.status(400).json({ error: 'ID, Name, and Price are required.' });
      }

      const existIdx = memoryRooms.findIndex(r => r.id === id);
      const room = {
        id,
        name,
        tagline: tagline || '',
        description: description || '',
        price: parseInt(price) || 0,
        image: image || '',
        amenities: amenities || [],
        inventory: parseInt(inventory) || 5
      };

      if (existIdx >= 0) {
        memoryRooms[existIdx] = room;
      } else {
        memoryRooms.push(room);
      }
      return res.status(200).json({ success: true, offline: true, message: `Room ${name} saved successfully.` });
    }

    if (method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Room ID is required.' });
      memoryRooms = memoryRooms.filter(r => r.id !== id);
      return res.status(200).json({ success: true, offline: true, message: 'Room deleted successfully.' });
    }

    return res.status(405).json({ error: 'Method Not Allowed.' });
  }

  if (method === 'POST') {
    const { id, name, tagline, description, price, image, amenities, inventory } = req.body || {};
    if (!id || !name || price === undefined) {
      return res.status(400).json({ error: 'ID, Name, and Price are required.' });
    }

    try {
      await sql`
        INSERT INTO rooms (id, name, tagline, description, price, image, amenities, inventory)
        VALUES (${id}, ${name}, ${tagline}, ${description}, ${price}, ${image}, ${amenities || []}, ${inventory || 5})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          tagline = EXCLUDED.tagline,
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          image = EXCLUDED.image,
          amenities = EXCLUDED.amenities,
          inventory = EXCLUDED.inventory
      `;
      return res.status(200).json({ success: true, message: `Room ${name} saved successfully.` });
    } catch (error) {
      console.error('Error saving room:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (method === 'DELETE') {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Room ID is required.' });
    }

    try {
      await sql`DELETE FROM rooms WHERE id = ${id}`;
      return res.status(200).json({ success: true, message: 'Room deleted successfully.' });
    } catch (error) {
      console.error('Error deleting room:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(455).json({ error: 'Method Not Allowed.' });
}

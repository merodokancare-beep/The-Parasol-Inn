import { sql, verifyAdmin } from './_db.js';

export default async function handler(req, res) {
  if (!sql) {
    return res.status(500).json({ error: 'Database connection offline.' });
  }

  const { method } = req;

  if (method === 'GET') {
    try {
      const rooms = await sql`SELECT * FROM rooms ORDER BY price ASC`;
      return res.status(200).json(rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Admin authorization check for mutating requests (POST, DELETE)
  const isAuthorized = await verifyAdmin(req);
  if (!isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized admin access.' });
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

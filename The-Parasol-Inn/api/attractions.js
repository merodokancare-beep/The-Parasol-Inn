import { sql, verifyAdmin } from './_db.js';

export default async function handler(req, res) {
  if (!sql) {
    return res.status(500).json({ error: 'Database connection offline.' });
  }

  const { method } = req;

  if (method === 'GET') {
    try {
      const attractions = await sql`SELECT * FROM attractions`;
      // Map drive_time back to driveTime for client-side compatibility
      const mapped = attractions.map(att => ({
        id: att.id,
        name: att.name,
        description: att.description,
        distance: att.distance,
        driveTime: att.drive_time,
        image: att.image
      }));
      return res.status(200).json(mapped);
    } catch (error) {
      console.error('Error fetching attractions:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Admin authorization check for mutating requests (POST, DELETE)
  const isAuthorized = await verifyAdmin(req);
  if (!isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized admin access.' });
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

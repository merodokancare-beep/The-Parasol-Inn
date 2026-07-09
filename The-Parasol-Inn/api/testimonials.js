import { sql, verifyAdmin } from './_db.js';

export default async function handler(req, res) {
  if (!sql) {
    return res.status(500).json({ error: 'Database connection offline.' });
  }

  const { method } = req;

  if (method === 'GET') {
    try {
      const testimonials = await sql`SELECT * FROM testimonials`;
      return res.status(200).json(testimonials);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Admin authorization check for mutating requests (POST, DELETE)
  const isAuthorized = await verifyAdmin(req);
  if (!isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized admin access.' });
  }

  if (method === 'POST') {
    const { id, quote, author, location, avatar } = req.body || {};
    if (!id || !quote || !author) {
      return res.status(400).json({ error: 'ID, Quote, and Author are required.' });
    }

    try {
      await sql`
        INSERT INTO testimonials (id, quote, author, location, avatar)
        VALUES (${id}, ${quote}, ${author}, ${location || ''}, ${avatar || ''})
        ON CONFLICT (id) DO UPDATE SET
          quote = EXCLUDED.quote,
          author = EXCLUDED.author,
          location = EXCLUDED.location,
          avatar = EXCLUDED.avatar
      `;
      return res.status(200).json({ success: true, message: 'Testimonial saved successfully.' });
    } catch (error) {
      console.error('Error saving testimonial:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (method === 'DELETE') {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Testimonial ID is required.' });
    }

    try {
      await sql`DELETE FROM testimonials WHERE id = ${id}`;
      return res.status(200).json({ success: true, message: 'Testimonial deleted successfully.' });
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(455).json({ error: 'Method Not Allowed.' });
}

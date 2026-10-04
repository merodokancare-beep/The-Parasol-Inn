import { sql, verifyAdmin } from './_db.js';
import { DEFAULT_TESTIMONIALS } from './_seeds.js';

let memoryTestimonials = [...DEFAULT_TESTIMONIALS];

export default async function handler(req, res) {
  const { method } = req;

  // Offline fallback if database is not connected
  if (!sql) {
    if (method === 'GET') {
      if (req.query.all === 'true') {
        const isAuth = await verifyAdmin(req);
        if (isAuth) {
          return res.status(200).json(memoryTestimonials);
        }
      }
      // Public website only gets approved reviews
      return res.status(200).json(memoryTestimonials.filter(t => t.status === 'approved' || !t.status));
    }

    if (method === 'POST') {
      const isCustomer = Boolean(req.body && req.body.isCustomerSubmission);
      if (isCustomer) {
        const { quote, author, location, avatar, rating } = req.body || {};
        if (!quote || !author) {
          return res.status(400).json({ error: 'Quote and Author Name are required.' });
        }
        const newReview = {
          id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          quote,
          author,
          location: location || 'Guest',
          avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          rating: parseInt(rating) || 5,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        memoryTestimonials.unshift(newReview);
        return res.status(200).json({
          success: true,
          offline: true,
          pending: true,
          testimonial: newReview,
          message: 'Thank you! Your review has been submitted and will appear once approved by our team.'
        });
      }

      // Admin modification
      const isAuthorized = await verifyAdmin(req);
      if (!isAuthorized) {
        return res.status(401).json({ error: 'Unauthorized admin access.' });
      }

      if (req.body.action === 'set_status' && req.body.id) {
        const item = memoryTestimonials.find(t => t.id === req.body.id);
        if (item) item.status = req.body.status === 'pending' ? 'pending' : 'approved';
        return res.status(200).json({ success: true, offline: true, message: `Status updated to ${req.body.status}.` });
      }

      const { id, quote, author, location, avatar, rating, status } = req.body || {};
      const existIdx = memoryTestimonials.findIndex(t => t.id === id);
      const updatedItem = {
        id: id || `test_${Date.now()}`,
        quote,
        author,
        location: location || 'Guest',
        avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        rating: parseInt(rating) || 5,
        status: status === 'pending' ? 'pending' : 'approved'
      };
      if (existIdx >= 0) {
        memoryTestimonials[existIdx] = updatedItem;
      } else {
        memoryTestimonials.unshift(updatedItem);
      }

      return res.status(200).json({ success: true, offline: true, message: 'Saved in offline mode.' });
    }

    if (method === 'DELETE') {
      const isAuthorized = await verifyAdmin(req);
      if (!isAuthorized) {
        return res.status(401).json({ error: 'Unauthorized admin access.' });
      }
      memoryTestimonials = memoryTestimonials.filter(t => t.id !== req.query.id);
      return res.status(200).json({ success: true, offline: true, message: 'Deleted in offline mode.' });
    }

    return res.status(405).json({ error: 'Method Not Allowed.' });
  }

  // Database is connected
  if (method === 'GET') {
    try {
      const isAuthorized = await verifyAdmin(req);
      if (isAuthorized && req.query.all === 'true') {
        const allReviews = await sql`
          SELECT * FROM testimonials 
          ORDER BY id DESC
        `;
        return res.status(200).json(allReviews);
      }

      // Live public website: return only approved reviews
      const approvedReviews = await sql`
        SELECT * FROM testimonials 
        WHERE status = 'approved' OR status IS NULL
        ORDER BY id DESC
      `;
      return res.status(200).json(approvedReviews);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (method === 'POST') {
    const isCustomer = Boolean(req.body && req.body.isCustomerSubmission);

    // 1. Customer Public Review Submission (No admin auth required)
    if (isCustomer) {
      const { quote, author, location, avatar, rating } = req.body || {};
      if (!quote || !author) {
        return res.status(400).json({ error: 'Quote and Author Name are required.' });
      }

      const id = `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const ratingNum = Math.min(5, Math.max(1, parseInt(rating) || 5));
      const cleanLocation = location ? String(location).trim() : 'Guest';
      const cleanAvatar = avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

      try {
        await sql`
          INSERT INTO testimonials (id, quote, author, location, avatar, rating, status)
          VALUES (${id}, ${quote}, ${author}, ${cleanLocation}, ${cleanAvatar}, ${ratingNum}, 'pending')
        `;
        return res.status(200).json({
          success: true,
          pending: true,
          testimonial: {
            id,
            quote,
            author,
            location: cleanLocation,
            avatar: cleanAvatar,
            rating: ratingNum,
            status: 'pending'
          },
          message: 'Thank you! Your review has been submitted and will appear on the website once approved by our team.'
        });
      } catch (insertErr) {
        // Fallback if status column not yet created
        try {
          await sql`
            INSERT INTO testimonials (id, quote, author, location, avatar, rating)
            VALUES (${id}, ${quote}, ${author}, ${cleanLocation}, ${cleanAvatar}, ${ratingNum})
          `;
          return res.status(200).json({
            success: true,
            pending: true,
            message: 'Thank you! Your review has been submitted for moderation.'
          });
        } catch (err2) {
          console.error('Error saving customer review:', err2);
          return res.status(500).json({ error: err2.message });
        }
      }
    }

    // 2. Admin Management (Requires valid admin authorization)
    const isAuthorized = await verifyAdmin(req);
    if (!isAuthorized) {
      return res.status(401).json({ error: 'Unauthorized admin access.' });
    }

    // Moderation quick status toggle
    if (req.body.action === 'set_status' && req.body.id) {
      const targetStatus = req.body.status === 'pending' ? 'pending' : 'approved';
      try {
        await sql`
          UPDATE testimonials 
          SET status = ${targetStatus}
          WHERE id = ${req.body.id}
        `;
        return res.status(200).json({ success: true, message: `Review status updated to ${targetStatus}.` });
      } catch (statErr) {
        console.error('Error updating review status:', statErr);
        return res.status(500).json({ error: statErr.message });
      }
    }

    const { id, quote, author, location, avatar, rating, status } = req.body || {};
    if (!id || !quote || !author) {
      return res.status(400).json({ error: 'ID, Quote, and Author are required.' });
    }

    const ratingNum = Math.min(5, Math.max(1, parseInt(rating) || 5));
    const targetStatus = status === 'pending' ? 'pending' : 'approved';

    try {
      await sql`
        INSERT INTO testimonials (id, quote, author, location, avatar, rating, status)
        VALUES (${id}, ${quote}, ${author}, ${location || ''}, ${avatar || ''}, ${ratingNum}, ${targetStatus})
        ON CONFLICT (id) DO UPDATE SET
          quote = EXCLUDED.quote,
          author = EXCLUDED.author,
          location = EXCLUDED.location,
          avatar = EXCLUDED.avatar,
          rating = EXCLUDED.rating,
          status = EXCLUDED.status
      `;
      return res.status(200).json({ success: true, message: 'Testimonial saved successfully.' });
    } catch (error) {
      try {
        await sql`
          INSERT INTO testimonials (id, quote, author, location, avatar, rating)
          VALUES (${id}, ${quote}, ${author}, ${location || ''}, ${avatar || ''}, ${ratingNum})
          ON CONFLICT (id) DO UPDATE SET
            quote = EXCLUDED.quote,
            author = EXCLUDED.author,
            location = EXCLUDED.location,
            avatar = EXCLUDED.avatar,
            rating = EXCLUDED.rating
        `;
        return res.status(200).json({ success: true, message: 'Testimonial saved successfully.' });
      } catch (err2) {
        console.error('Error saving testimonial:', err2);
        return res.status(500).json({ error: err2.message });
      }
    }
  }

  if (method === 'DELETE') {
    const isAuthorized = await verifyAdmin(req);
    if (!isAuthorized) {
      return res.status(401).json({ error: 'Unauthorized admin access.' });
    }

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

  return res.status(405).json({ error: 'Method Not Allowed.' });
}

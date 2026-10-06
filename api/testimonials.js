const db = require('./db');

module.exports = async (req, res) => {
    try {
        if (req.method === 'GET') {
            if (req.query.all === 'true') {
                const result = await db.query('SELECT * FROM testimonials ORDER BY id DESC');
                return res.status(200).json(result.rows);
            }
            const result = await db.query("SELECT * FROM testimonials WHERE status = 'approved' OR status IS NULL ORDER BY id DESC");
            return res.status(200).json(result.rows);
        }

        if (req.method === 'POST') {
            const isCustomer = Boolean(req.body && req.body.isCustomerSubmission);
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
                    await db.query(
                        'INSERT INTO testimonials (id, avatar, author, location, quote, rating, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                        [id, cleanAvatar, author, cleanLocation, quote, ratingNum, 'pending']
                    );
                } catch (colErr) {
                    await db.query(
                        'INSERT INTO testimonials (id, avatar, author, location, quote, rating) VALUES ($1, $2, $3, $4, $5, $6)',
                        [id, cleanAvatar, author, cleanLocation, quote, ratingNum]
                    );
                }
                return res.status(200).json({
                    success: true,
                    pending: true,
                    message: 'Thank you! Your review has been submitted and will appear on the website once approved by our team.'
                });
            }

            if (req.body.action === 'set_status' && req.body.id) {
                const targetStatus = req.body.status === 'pending' ? 'pending' : 'approved';
                await db.query('UPDATE testimonials SET status = $1 WHERE id = $2', [targetStatus, req.body.id]);
                return res.status(200).json({ success: true, message: `Status updated to ${targetStatus}` });
            }

            const { id, avatar, author, location, quote, rating, status, video_url } = req.body;
            const targetStatus = status === 'pending' ? 'pending' : 'approved';
            const cleanVideoUrl = video_url ? String(video_url).trim() : '';
            try {
                await db.query(
                    'INSERT INTO testimonials (id, avatar, author, location, quote, rating, status, video_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO UPDATE SET avatar=$2, author=$3, location=$4, quote=$5, rating=$6, status=$7, video_url=$8',
                    [id, avatar, author, location, quote, parseInt(rating) || 5, targetStatus, cleanVideoUrl]
                );
            } catch (colErr) {
                try {
                    await db.query(
                        'INSERT INTO testimonials (id, avatar, author, location, quote, rating, status) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO UPDATE SET avatar=$2, author=$3, location=$4, quote=$5, rating=$6, status=$7',
                        [id, avatar, author, location, quote, parseInt(rating) || 5, targetStatus]
                    );
                } catch (colErr2) {
                    await db.query(
                        'INSERT INTO testimonials (id, avatar, author, location, quote, rating) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO UPDATE SET avatar=$2, author=$3, location=$4, quote=$5, rating=$6',
                        [id, avatar, author, location, quote, parseInt(rating) || 5]
                    );
                }
            }
            return res.status(200).json({ success: true, message: "Testimonial saved successfully." });
        }

        if (req.method === 'DELETE') {
            const id = req.query.id || req.body.id;
            if (!id) return res.status(400).json({ success: false, error: "Missing testimonial ID." });
            await db.query('DELETE FROM testimonials WHERE id = $1', [id]);
            return res.status(200).json({ success: true, message: "Testimonial deleted." });
        }

        res.status(405).json({ success: false, error: "Method not allowed." });
    } catch (error) {
        console.error("Testimonials API error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

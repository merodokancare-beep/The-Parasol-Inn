const db = require('./db');

module.exports = async (req, res) => {
    try {
        if (req.method === 'GET') {
            const result = await db.query('SELECT * FROM testimonials ORDER BY id DESC');
            return res.status(200).json(result.rows);
        }

        if (req.method === 'POST') {
            const { id, avatar, author, location, quote } = req.body;
            await db.query(
                'INSERT INTO testimonials (id, avatar, author, location, quote) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET avatar=$2, author=$3, location=$4, quote=$5',
                [id, avatar, author, location, quote]
            );
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

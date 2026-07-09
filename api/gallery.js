const db = require('./db');

module.exports = async (req, res) => {
    try {
        if (req.method === 'GET') {
            const result = await db.query('SELECT * FROM gallery ORDER BY id DESC');
            return res.status(200).json(result.rows);
        }

        if (req.method === 'POST') {
            const { id, title, category, image } = req.body;
            await db.query(
                'INSERT INTO gallery (id, title, category, image) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET title=$2, category=$3, image=$4',
                [id, title, category, image]
            );
            return res.status(200).json({ success: true, message: "Gallery item saved successfully." });
        }

        if (req.method === 'DELETE') {
            const id = req.query.id || req.body.id;
            if (!id) return res.status(400).json({ success: false, error: "Missing gallery item ID." });
            await db.query('DELETE FROM gallery WHERE id = $1', [id]);
            return res.status(200).json({ success: true, message: "Gallery item deleted." });
        }

        res.status(405).json({ success: false, error: "Method not allowed." });
    } catch (error) {
        console.error("Gallery API error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

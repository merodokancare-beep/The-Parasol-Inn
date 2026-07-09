const db = require('./db');

module.exports = async (req, res) => {
    try {
        if (req.method === 'GET') {
            const result = await db.query('SELECT * FROM rooms');
            const rooms = result.rows.map(r => ({
                ...r,
                price: parseInt(r.price),
                inventory: parseInt(r.inventory),
                amenities: typeof r.amenities === 'string' ? JSON.parse(r.amenities) : r.amenities
            }));
            return res.status(200).json(rooms);
        }

        if (req.method === 'POST') {
            const { id, name, tagline, price, inventory, image, description, amenities } = req.body;
            await db.query(
                'INSERT INTO rooms (id, name, tagline, price, inventory, image, description, amenities) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO UPDATE SET name=$2, tagline=$3, price=$4, inventory=$5, image=$6, description=$7, amenities=$8',
                [id, name, tagline, price, inventory, image, description, JSON.stringify(amenities)]
            );
            return res.status(200).json({ success: true, message: `Room ${name} saved successfully.` });
        }

        if (req.method === 'DELETE') {
            const id = req.query.id || req.body.id;
            if (!id) return res.status(400).json({ success: false, error: "Missing room id." });

            await db.query('DELETE FROM rooms WHERE id = $1', [id]);
            return res.status(200).json({ success: true, message: `Room deleted.` });
        }

        res.status(405).json({ success: false, error: "Method not allowed." });
    } catch (error) {
        console.error("Rooms API error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

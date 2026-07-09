const db = require('./db');

module.exports = async (req, res) => {
    try {
        if (req.method === 'GET') {
            const result = await db.query('SELECT * FROM attractions ORDER BY id DESC');
            const attractions = result.rows.map(a => ({
                ...a,
                driveTime: a.drive_time
            }));
            return res.status(200).json(attractions);
        }

        if (req.method === 'POST') {
            const { id, name, distance, driveTime, drive_time, image, description } = req.body;
            const dTime = driveTime || drive_time || '';
            await db.query(
                'INSERT INTO attractions (id, name, distance, drive_time, image, description) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO UPDATE SET name=$2, distance=$3, drive_time=$4, image=$5, description=$6',
                [id, name, distance, dTime, image, description]
            );
            return res.status(200).json({ success: true, message: "Attraction saved successfully." });
        }

        if (req.method === 'DELETE') {
            const id = req.query.id || req.body.id;
            if (!id) return res.status(400).json({ success: false, error: "Missing attraction ID." });
            await db.query('DELETE FROM attractions WHERE id = $1', [id]);
            return res.status(200).json({ success: true, message: "Attraction deleted." });
        }

        res.status(405).json({ success: false, error: "Method not allowed." });
    } catch (error) {
        console.error("Attractions API error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

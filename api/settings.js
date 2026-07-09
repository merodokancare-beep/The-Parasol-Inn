const db = require('./db');

module.exports = async (req, res) => {
    try {
        if (req.method === 'GET') {
            const result = await db.query('SELECT * FROM settings');
            const settings = {};
            result.rows.forEach(r => {
                let val = r.value;
                if (val && (val.startsWith('{') || val.startsWith('['))) {
                    try {
                        val = JSON.parse(r.value);
                    } catch (e) {
                        // ignore
                    }
                }
                settings[r.key] = val;
            });
            return res.status(200).json(settings);
        }

        if (req.method === 'POST') {
            const settingsData = req.body;
            for (const [key, value] of Object.entries(settingsData)) {
                const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
                await db.query(
                    'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
                    [key, valStr]
                );
            }
            return res.status(200).json({ success: true, message: "Settings saved successfully." });
        }

        res.status(405).json({ success: false, error: "Method not allowed." });
    } catch (error) {
        console.error("Settings API error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const db = require('./db');

module.exports = async (req, res) => {
    try {
        if (req.method === 'GET') {
            // Fetch newest submissions first
            const result = await db.query('SELECT * FROM enquiries ORDER BY id DESC');
            const enquiries = result.rows.map(e => ({
                ...e,
                roomType: e.room_type,
                room_type: e.room_type_id,
                guests: parseInt(e.guests),
                cost: parseInt(e.cost)
            }));
            return res.status(200).json(enquiries);
        }

        if (req.method === 'POST') {
            const { id, name, phone, email, checkin, checkout, guests, roomType, room_type, message, cost, status, source, date } = req.body;
            
            const rType = roomType || '';
            const rTypeId = room_type || '';

            await db.query(
                `INSERT INTO enquiries (id, name, phone, email, checkin, checkout, guests, room_type, room_type_id, message, cost, status, source, date) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
                 ON CONFLICT (id) DO UPDATE SET name=$2, phone=$3, email=$4, checkin=$5, checkout=$6, guests=$7, room_type=$8, room_type_id=$9, message=$10, cost=$11, status=$12, source=$13, date=$14`,
                [id, name, phone, email, checkin, checkout, parseInt(guests) || 2, rType, rTypeId, message, parseInt(cost) || 0, status || 'Pending', source || 'Online', date]
            );
            return res.status(200).json({ success: true, message: `Enquiry logged successfully.` });
        }

        if (req.method === 'PUT') {
            const { id, status } = req.body;
            await db.query('UPDATE enquiries SET status = $1 WHERE id = $2', [status, id]);
            return res.status(200).json({ success: true, message: `Status updated to ${status}.` });
        }

        if (req.method === 'DELETE') {
            const clearAll = req.query.clear === 'true';
            if (clearAll) {
                await db.query('DELETE FROM enquiries');
                return res.status(200).json({ success: true, message: `All enquiries cleared.` });
            }

            const id = req.query.id || req.body.id;
            if (!id) return res.status(400).json({ success: false, error: "Missing enquiry id." });

            await db.query('DELETE FROM enquiries WHERE id = $1', [id]);
            return res.status(200).json({ success: true, message: `Enquiry deleted.` });
        }

        res.status(405).json({ success: false, error: "Method not allowed." });
    } catch (error) {
        console.error("Enquiries API error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

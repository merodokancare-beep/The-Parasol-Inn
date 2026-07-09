import { sql, verifyAdmin } from './_db.js';

export default async function handler(req, res) {
  if (!sql) {
    return res.status(500).json({ error: 'Database connection offline.' });
  }

  const { method } = req;

  // POST (Public submission of a new enquiry/booking)
  if (method === 'POST') {
    const {
      id,
      name,
      email,
      phone,
      checkin,
      checkout,
      guests,
      roomType, // maps to room_type_name
      room_type, // maps to room_type_id
      message,
      cost,
      status,
      source,
      date
    } = req.body || {};

    if (!name || !email || !phone || !checkin || !checkout || !roomType) {
      return res.status(400).json({ error: 'Missing required booking fields.' });
    }

    const enqId = id || 'enq_' + Date.now();
    const guestCount = parseInt(guests) || 1;
    const estCost = parseInt(cost) || 0;
    const enqStatus = status || 'Pending';
    const enqSource = source || 'Online';

    // Format date string if not provided
    const enqDate = date || (new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    try {
      await sql`
        INSERT INTO enquiries (id, name, email, phone, checkin, checkout, guests, room_type_name, room_type_id, message, cost, status, source, date)
        VALUES (${enqId}, ${name}, ${email}, ${phone}, ${checkin}, ${checkout}, ${guestCount}, ${roomType}, ${room_type || ''}, ${message || ''}, ${estCost}, ${enqStatus}, ${enqSource}, ${enqDate})
      `;
      return res.status(200).json({ success: true, id: enqId, message: 'Enquiry submitted successfully.' });
    } catch (error) {
      console.error('Error creating enquiry:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // GET (List all enquiries - Public is allowed sanitized list for availability check, Admin gets full details)
  if (method === 'GET') {
    try {
      const isAuthorized = await verifyAdmin(req);
      
      // Sort enquiries by id descending so newest are on top (since id is enq_timestamp)
      const enquiries = await sql`SELECT * FROM enquiries ORDER BY date DESC, id DESC`;
      
      if (isAuthorized) {
        // Map database schema to frontend properties
        const mapped = enquiries.map(e => ({
          id: e.id,
          name: e.name,
          email: e.email,
          phone: e.phone,
          checkin: e.checkin,
          checkout: e.checkout,
          guests: e.guests,
          roomType: e.room_type_name,
          room_type: e.room_type_id,
          message: e.message,
          cost: e.cost,
          status: e.status,
          source: e.source,
          date: e.date
        }));
        return res.status(200).json(mapped);
      } else {
        // Return only status, checkin, checkout, roomType, and room_type for public availability calculation
        const sanitized = enquiries
          .filter(e => e.status === 'Confirmed')
          .map(e => ({
            checkin: e.checkin,
            checkout: e.checkout,
            roomType: e.room_type_name,
            room_type: e.room_type_id,
            status: e.status
          }));
        return res.status(200).json(sanitized);
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Admin authorization check for other mutating methods (PUT, DELETE)
  const isAuthorized = await verifyAdmin(req);
  if (!isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized admin access.' });
  }

  // PUT (Update status)
  if (method === 'PUT') {
    const { id, status } = req.body || {};
    if (!id || !status) {
      return res.status(400).json({ error: 'Enquiry ID and Status are required.' });
    }

    try {
      await sql`UPDATE enquiries SET status = ${status} WHERE id = ${id}`;
      return res.status(200).json({ success: true, message: `Enquiry status updated to ${status}.` });
    } catch (error) {
      console.error('Error updating enquiry:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // DELETE (Delete single or clear all)
  if (method === 'DELETE') {
    const { id, clear } = req.query;

    try {
      if (clear === 'true') {
        await sql`DELETE FROM enquiries`;
        return res.status(200).json({ success: true, message: 'All enquiries cleared successfully.' });
      }

      if (!id) {
        return res.status(400).json({ error: 'Enquiry ID is required.' });
      }

      await sql`DELETE FROM enquiries WHERE id = ${id}`;
      return res.status(200).json({ success: true, message: 'Enquiry deleted successfully.' });
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(455).json({ error: 'Method Not Allowed.' });
}

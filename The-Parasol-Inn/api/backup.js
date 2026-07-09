import { sql, verifyAdmin, ensureTablesExist } from './_db.js';
import {
  DEFAULT_ROOMS,
  DEFAULT_GALLERY,
  DEFAULT_ATTRACTIONS,
  DEFAULT_TESTIMONIALS,
  DEFAULT_SETTINGS
} from './_seeds.js';

export default async function handler(req, res) {
  if (!sql) {
    return res.status(500).json({ error: 'Database connection offline.' });
  }

  // Admin authorization check
  const isAuthorized = await verifyAdmin(req);
  if (!isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized admin access.' });
  }

  const { method } = req;

  // GET (Export backup)
  if (method === 'GET') {
    try {
      const [rooms, gallery, attractions, testimonials, settings, enquiries] = await Promise.all([
        sql`SELECT * FROM rooms`,
        sql`SELECT * FROM gallery`,
        sql`SELECT * FROM attractions`,
        sql`SELECT * FROM testimonials`,
        sql`SELECT * FROM settings WHERE id = 'global'`,
        sql`SELECT * FROM enquiries`
      ]);

      // Map drive_time to driveTime in attractions for client compatibility
      const mappedAttractions = attractions.map(att => ({
        id: att.id,
        name: att.name,
        description: att.description,
        distance: att.distance,
        driveTime: att.drive_time,
        image: att.image
      }));

      // Map settings snake_case to camelCase
      const mappedSettings = settings.length > 0 ? {
        phoneFrontDesk: settings[0].phone_front_desk,
        phoneReservations: settings[0].phone_reservations,
        emailInfo: settings[0].email_info,
        emailBooking: settings[0].email_booking,
        whatsapp: settings[0].whatsapp,
        address: settings[0].address,
        passcode: settings[0].passcode
      } : {};

      // Map enquiries DB schema to client schema
      const mappedEnquiries = enquiries.map(e => ({
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

      return res.status(200).json({
        rooms,
        gallery,
        attractions: mappedAttractions,
        testimonials,
        settings: mappedSettings,
        enquiries: mappedEnquiries
      });
    } catch (error) {
      console.error('Error exporting database backup:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // POST (Restore backup)
  if (method === 'POST') {
    const { rooms, gallery, attractions, testimonials, settings, enquiries } = req.body || {};

    try {
      // Ensure tables exist before restoration
      await ensureTablesExist();

      // 1. Clear all tables
      await Promise.all([
        sql`DELETE FROM rooms`,
        sql`DELETE FROM gallery`,
        sql`DELETE FROM attractions`,
        sql`DELETE FROM testimonials`,
        sql`DELETE FROM settings`,
        sql`DELETE FROM enquiries`
      ]);

      // 2. Re-insert items sequentially or parallelly
      if (Array.isArray(rooms)) {
        for (const room of rooms) {
          await sql`
            INSERT INTO rooms (id, name, tagline, description, price, image, amenities, inventory)
            VALUES (${room.id}, ${room.name}, ${room.tagline}, ${room.description}, ${room.price}, ${room.image}, ${room.amenities}, ${room.inventory})
          `;
        }
      }

      if (Array.isArray(gallery)) {
        for (const item of gallery) {
          await sql`
            INSERT INTO gallery (id, category, image, title)
            VALUES (${item.id}, ${item.category}, ${item.image}, ${item.title})
          `;
        }
      }

      if (Array.isArray(attractions)) {
        for (const att of attractions) {
          await sql`
            INSERT INTO attractions (id, name, description, distance, drive_time, image)
            VALUES (${att.id}, ${att.name}, ${att.description}, ${att.distance}, ${att.driveTime || att.drive_time}, ${att.image})
          `;
        }
      }

      if (Array.isArray(testimonials)) {
        for (const test of testimonials) {
          await sql`
            INSERT INTO testimonials (id, quote, author, location, avatar)
            VALUES (${test.id}, ${test.quote}, ${test.author}, ${test.location}, ${test.avatar})
          `;
        }
      }

      if (settings) {
        await sql`
          INSERT INTO settings (id, phone_front_desk, phone_reservations, email_info, email_booking, whatsapp, address, passcode)
          VALUES ('global', ${settings.phoneFrontDesk}, ${settings.phoneReservations}, ${settings.emailInfo}, ${settings.emailBooking}, ${settings.whatsapp}, ${settings.address}, ${settings.passcode || 'admin123'})
        `;
      }

      if (Array.isArray(enquiries)) {
        for (const enq of enquiries) {
          await sql`
            INSERT INTO enquiries (id, name, email, phone, checkin, checkout, guests, room_type_name, room_type_id, message, cost, status, source, date)
            VALUES (${enq.id}, ${enq.name}, ${enq.email}, ${enq.phone}, ${enq.checkin}, ${enq.checkout}, ${parseInt(enq.guests) || 1}, ${enq.roomType}, ${enq.room_type || ''}, ${enq.message || ''}, ${parseInt(enq.cost) || 0}, ${enq.status || 'Pending'}, ${enq.source || 'Online'}, ${enq.date})
          `;
        }
      }

      return res.status(200).json({ success: true, message: 'Database restored successfully.' });
    } catch (error) {
      console.error('Error restoring database backup:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // DELETE (Reset to Defaults)
  if (method === 'DELETE') {
    try {
      // Ensure tables exist before clearing
      await ensureTablesExist();

      // 1. Wipe everything
      await Promise.all([
        sql`DELETE FROM rooms`,
        sql`DELETE FROM gallery`,
        sql`DELETE FROM attractions`,
        sql`DELETE FROM testimonials`,
        sql`DELETE FROM settings`,
        sql`DELETE FROM enquiries`
      ]);

      // 2. Reseed with defaults
      for (const room of DEFAULT_ROOMS) {
        await sql`
          INSERT INTO rooms (id, name, tagline, description, price, image, amenities, inventory)
          VALUES (${room.id}, ${room.name}, ${room.tagline}, ${room.description}, ${room.price}, ${room.image}, ${room.amenities}, ${room.inventory})
        `;
      }

      for (const item of DEFAULT_GALLERY) {
        await sql`
          INSERT INTO gallery (id, category, image, title)
          VALUES (${item.id}, ${item.category}, ${item.image}, ${item.title})
        `;
      }

      for (const att of DEFAULT_ATTRACTIONS) {
        await sql`
          INSERT INTO attractions (id, name, description, distance, drive_time, image)
          VALUES (${att.id}, ${att.name}, ${att.description}, ${att.distance}, ${att.driveTime || att.drive_time}, ${att.image})
        `;
      }

      for (const test of DEFAULT_TESTIMONIALS) {
        await sql`
          INSERT INTO testimonials (id, quote, author, location, avatar)
          VALUES (${test.id}, ${test.quote}, ${test.author}, ${test.location}, ${test.avatar})
        `;
      }

      await sql`
        INSERT INTO settings (id, phone_front_desk, phone_reservations, email_info, email_booking, whatsapp, address, passcode)
        VALUES ('global', ${DEFAULT_SETTINGS.phoneFrontDesk}, ${DEFAULT_SETTINGS.phoneReservations}, ${DEFAULT_SETTINGS.emailInfo}, ${DEFAULT_SETTINGS.emailBooking}, ${DEFAULT_SETTINGS.whatsapp}, ${DEFAULT_SETTINGS.address}, ${DEFAULT_SETTINGS.passcode})
      `;

      return res.status(200).json({ success: true, message: 'Database reset to default settings.' });
    } catch (error) {
      console.error('Error resetting database to defaults:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(455).json({ error: 'Method Not Allowed.' });
}

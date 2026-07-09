import { sql, verifyAdmin } from './_db.js';

export default async function handler(req, res) {
  if (!sql) {
    return res.status(500).json({ error: 'Database connection offline.' });
  }

  const { method } = req;

  if (method === 'GET') {
    try {
      const result = await sql`SELECT * FROM settings WHERE id = 'global'`;
      
      const defaultSettings = {
        phoneFrontDesk: "+91 3592 202202",
        phoneReservations: "+91 98765 43210",
        emailInfo: "info@theparasolinnsikkim.com",
        emailBooking: "booking@theparasolinnsikkim.com",
        whatsapp: "+919876543210",
        address: "The Parasol Inn Sikkim, Near Ridge Park, Gangtok, Sikkim - 737101, India"
      };

      if (result.length === 0) {
        // Return default public settings
        return res.status(200).json(defaultSettings);
      }

      const dbData = result[0];
      const isAuthorized = await verifyAdmin(req);

      const responseData = {
        phoneFrontDesk: dbData.phone_front_desk,
        phoneReservations: dbData.phone_reservations,
        emailInfo: dbData.email_info,
        emailBooking: dbData.email_booking,
        whatsapp: dbData.whatsapp,
        address: dbData.address
      };

      if (isAuthorized) {
        responseData.passcode = dbData.passcode;
      }

      return res.status(200).json(responseData);
    } catch (error) {
      console.error('Error fetching settings:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Admin authorization check for mutating requests (POST)
  const isAuthorized = await verifyAdmin(req);
  if (!isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized admin access.' });
  }

  if (method === 'POST') {
    const { phoneFrontDesk, phoneReservations, emailInfo, emailBooking, whatsapp, address, passcode } = req.body || {};

    try {
      if (passcode !== undefined && passcode !== null && passcode.trim() !== '') {
        await sql`
          INSERT INTO settings (id, phone_front_desk, phone_reservations, email_info, email_booking, whatsapp, address, passcode)
          VALUES ('global', ${phoneFrontDesk}, ${phoneReservations}, ${emailInfo}, ${emailBooking}, ${whatsapp}, ${address}, ${passcode})
          ON CONFLICT (id) DO UPDATE SET
            phone_front_desk = EXCLUDED.phone_front_desk,
            phone_reservations = EXCLUDED.phone_reservations,
            email_info = EXCLUDED.email_info,
            email_booking = EXCLUDED.email_booking,
            whatsapp = EXCLUDED.whatsapp,
            address = EXCLUDED.address,
            passcode = EXCLUDED.passcode
        `;
      } else {
        await sql`
          INSERT INTO settings (id, phone_front_desk, phone_reservations, email_info, email_booking, whatsapp, address)
          VALUES ('global', ${phoneFrontDesk}, ${phoneReservations}, ${emailInfo}, ${emailBooking}, ${whatsapp}, ${address})
          ON CONFLICT (id) DO UPDATE SET
            phone_front_desk = EXCLUDED.phone_front_desk,
            phone_reservations = EXCLUDED.phone_reservations,
            email_info = EXCLUDED.email_info,
            email_booking = EXCLUDED.email_booking,
            whatsapp = EXCLUDED.whatsapp,
            address = EXCLUDED.address
        `;
      }

      return res.status(200).json({ success: true, message: 'Settings saved successfully.' });
    } catch (error) {
      console.error('Error saving settings:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(455).json({ error: 'Method Not Allowed.' });
}

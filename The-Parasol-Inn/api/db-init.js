import { sql, ensureTablesExist } from './_db.js';
import {
  DEFAULT_ROOMS,
  DEFAULT_GALLERY,
  DEFAULT_ATTRACTIONS,
  DEFAULT_TESTIMONIALS,
  DEFAULT_SETTINGS
} from './_seeds.js';

export default async function handler(req, res) {
  if (!sql) {
    return res.status(500).json({ error: "Database connection not established. Make sure DATABASE_URL is set." });
  }

  try {
    // 1. Create tables if not exists
    await ensureTablesExist();

    // 2. Seed tables if they are empty
    
    // Seed Rooms
    const roomsCount = await sql`SELECT count(*) FROM rooms`;
    if (parseInt(roomsCount[0].count) === 0) {
      for (const room of DEFAULT_ROOMS) {
        await sql`
          INSERT INTO rooms (id, name, tagline, description, price, image, amenities, inventory)
          VALUES (${room.id}, ${room.name}, ${room.tagline}, ${room.description}, ${room.price}, ${room.image}, ${room.amenities}, ${room.inventory})
        `;
      }
    }

    // Seed Gallery
    const galleryCount = await sql`SELECT count(*) FROM gallery`;
    if (parseInt(galleryCount[0].count) === 0) {
      for (const item of DEFAULT_GALLERY) {
        await sql`
          INSERT INTO gallery (id, category, image, title)
          VALUES (${item.id}, ${item.category}, ${item.image}, ${item.title})
        `;
      }
    }

    // Seed Attractions
    const attractionsCount = await sql`SELECT count(*) FROM attractions`;
    if (parseInt(attractionsCount[0].count) === 0) {
      for (const att of DEFAULT_ATTRACTIONS) {
        await sql`
          INSERT INTO attractions (id, name, description, distance, drive_time, image)
          VALUES (${att.id}, ${att.name}, ${att.description}, ${att.distance}, ${att.driveTime || att.drive_time}, ${att.image})
        `;
      }
    }

    // Seed Testimonials
    const testimonialsCount = await sql`SELECT count(*) FROM testimonials`;
    if (parseInt(testimonialsCount[0].count) === 0) {
      for (const test of DEFAULT_TESTIMONIALS) {
        await sql`
          INSERT INTO testimonials (id, quote, author, location, avatar)
          VALUES (${test.id}, ${test.quote}, ${test.author}, ${test.location}, ${test.avatar})
        `;
      }
    }

    // Seed Settings
    const settingsCount = await sql`SELECT count(*) FROM settings`;
    if (parseInt(settingsCount[0].count) === 0) {
      await sql`
        INSERT INTO settings (id, phone_front_desk, phone_reservations, email_info, email_booking, whatsapp, address, passcode)
        VALUES ('global', ${DEFAULT_SETTINGS.phoneFrontDesk}, ${DEFAULT_SETTINGS.phoneReservations}, ${DEFAULT_SETTINGS.emailInfo}, ${DEFAULT_SETTINGS.emailBooking}, ${DEFAULT_SETTINGS.whatsapp}, ${DEFAULT_SETTINGS.address}, ${DEFAULT_SETTINGS.passcode})
      `;
    }

    return res.status(200).json({ status: "success", message: "Database initialized and seeded successfully." });

  } catch (error) {
    console.error("Database initialization failed:", error);
    return res.status(500).json({ error: error.message });
  }
}

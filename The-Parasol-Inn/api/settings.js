import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sql, verifyAdmin } from './_db.js';
import { DEFAULT_SETTINGS } from './_seeds.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_SETTINGS_FILE = path.join(__dirname, '_local_settings.json');

let memorySettings = { ...DEFAULT_SETTINGS };
if (fs.existsSync(LOCAL_SETTINGS_FILE)) {
  try {
    const raw = fs.readFileSync(LOCAL_SETTINGS_FILE, 'utf8');
    memorySettings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.warn("Could not read local settings file:", e);
  }
}

function saveLocalSettings(settings) {
  try {
    fs.writeFileSync(LOCAL_SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
  } catch (e) {
    console.warn("Could not save to local settings file:", e);
  }
}

export default async function handler(req, res) {
  const { method } = req;

  if (!sql) {
    if (method === 'GET') {
      const isAuthorized = await verifyAdmin(req);
      const resp = { ...memorySettings };
      if (!isAuthorized) {
        delete resp.passcode;
      }
      return res.status(200).json(resp);
    }

    const isAuthorized = await verifyAdmin(req);
    if (!isAuthorized) {
      return res.status(401).json({ error: 'Unauthorized admin access.' });
    }

    if (method === 'POST') {
      const body = req.body || {};
      memorySettings = { ...memorySettings, ...body };
      if (typeof memorySettings.aboutTimeline === 'string') {
        try {
          memorySettings.aboutTimeline = JSON.parse(memorySettings.aboutTimeline);
        } catch (e) {
          // ignore
        }
      }
      saveLocalSettings(memorySettings);
      return res.status(200).json({ success: true, offline: true, settings: memorySettings, message: 'Settings saved in offline mode.' });
    }

    return res.status(405).json({ error: 'Method Not Allowed.' });
  }

  if (method === 'GET') {
    try {
      const result = await sql`SELECT * FROM settings WHERE id = 'global'`;

      if (result.length === 0) {
        // Return default public settings
        return res.status(200).json(DEFAULT_SETTINGS);
      }

      const dbData = result[0];
      const isAuthorized = await verifyAdmin(req);

      let parsedTimeline = DEFAULT_SETTINGS.aboutTimeline;
      if (dbData.about_timeline) {
        try {
          parsedTimeline = typeof dbData.about_timeline === 'string' ? JSON.parse(dbData.about_timeline) : dbData.about_timeline;
        } catch (e) {
          console.warn("Error parsing about_timeline from DB:", e);
        }
      }

      const responseData = {
        phoneFrontDesk: dbData.phone_front_desk || DEFAULT_SETTINGS.phoneFrontDesk,
        phoneReservations: dbData.phone_reservations || DEFAULT_SETTINGS.phoneReservations,
        emailInfo: dbData.email_info || DEFAULT_SETTINGS.emailInfo,
        emailBooking: dbData.email_booking || DEFAULT_SETTINGS.emailBooking,
        whatsapp: dbData.whatsapp || DEFAULT_SETTINGS.whatsapp,
        address: dbData.address || DEFAULT_SETTINGS.address,
        testimonialsSubtitle: dbData.testimonials_subtitle || DEFAULT_SETTINGS.testimonialsSubtitle,
        testimonialsTitle: dbData.testimonials_title || DEFAULT_SETTINGS.testimonialsTitle,
        aboutHeroTitle: dbData.about_hero_title || DEFAULT_SETTINGS.aboutHeroTitle,
        aboutHeroSubtitle: dbData.about_hero_subtitle || DEFAULT_SETTINGS.aboutHeroSubtitle,
        aboutHeroImage: dbData.about_hero_image || DEFAULT_SETTINGS.aboutHeroImage,
        aboutBadge: dbData.about_badge || DEFAULT_SETTINGS.aboutBadge,
        aboutHeading: dbData.about_heading || DEFAULT_SETTINGS.aboutHeading,
        aboutStoryP1: dbData.about_story_p1 || DEFAULT_SETTINGS.aboutStoryP1,
        aboutStoryP2: dbData.about_story_p2 || DEFAULT_SETTINGS.aboutStoryP2,
        aboutStoryP3: dbData.about_story_p3 || DEFAULT_SETTINGS.aboutStoryP3,
        aboutImg1: dbData.about_img_1 || DEFAULT_SETTINGS.aboutImg1,
        aboutImg2: dbData.about_img_2 || DEFAULT_SETTINGS.aboutImg2,
        aboutVision: dbData.about_vision || DEFAULT_SETTINGS.aboutVision,
        aboutMission: dbData.about_mission || DEFAULT_SETTINGS.aboutMission,
        aboutTimelineSubtitle: dbData.about_timeline_subtitle || DEFAULT_SETTINGS.aboutTimelineSubtitle,
        aboutTimelineTitle: dbData.about_timeline_title || DEFAULT_SETTINGS.aboutTimelineTitle,
        aboutTimeline: parsedTimeline,
        aboutTeamSubtitle: dbData.about_team_subtitle || DEFAULT_SETTINGS.aboutTeamSubtitle,
        aboutTeamTitle: dbData.about_team_title || DEFAULT_SETTINGS.aboutTeamTitle
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
    const {
      phoneFrontDesk,
      phoneReservations,
      emailInfo,
      emailBooking,
      whatsapp,
      address,
      passcode,
      testimonialsSubtitle,
      testimonialsTitle,
      aboutHeroTitle,
      aboutHeroSubtitle,
      aboutHeroImage,
      aboutBadge,
      aboutHeading,
      aboutStoryP1,
      aboutStoryP2,
      aboutStoryP3,
      aboutImg1,
      aboutImg2,
      aboutVision,
      aboutMission,
      aboutTimelineSubtitle,
      aboutTimelineTitle,
      aboutTimeline,
      aboutTeamSubtitle,
      aboutTeamTitle
    } = req.body || {};

    try {
      // Get existing settings to support partial updates
      const existing = await sql`SELECT * FROM settings WHERE id = 'global'`;
      const current = existing[0] || {};

      const finalPhoneDesk = phoneFrontDesk !== undefined ? phoneFrontDesk : (current.phone_front_desk || DEFAULT_SETTINGS.phoneFrontDesk);
      const finalPhoneRes = phoneReservations !== undefined ? phoneReservations : (current.phone_reservations || DEFAULT_SETTINGS.phoneReservations);
      const finalEmailInfo = emailInfo !== undefined ? emailInfo : (current.email_info || DEFAULT_SETTINGS.emailInfo);
      const finalEmailBook = emailBooking !== undefined ? emailBooking : (current.email_booking || DEFAULT_SETTINGS.emailBooking);
      const finalWhatsapp = whatsapp !== undefined ? whatsapp : (current.whatsapp || DEFAULT_SETTINGS.whatsapp);
      const finalAddress = address !== undefined ? address : (current.address || DEFAULT_SETTINGS.address);
      const finalPasscode = (passcode !== undefined && passcode !== null && passcode.trim() !== '') ? passcode : (current.passcode || DEFAULT_SETTINGS.passcode);
      const finalTestSub = testimonialsSubtitle !== undefined ? testimonialsSubtitle : (current.testimonials_subtitle || DEFAULT_SETTINGS.testimonialsSubtitle);
      const finalTestTitle = testimonialsTitle !== undefined ? testimonialsTitle : (current.testimonials_title || DEFAULT_SETTINGS.testimonialsTitle);

      const finalAboutHeroTitle = aboutHeroTitle !== undefined ? aboutHeroTitle : (current.about_hero_title || DEFAULT_SETTINGS.aboutHeroTitle);
      const finalAboutHeroSubtitle = aboutHeroSubtitle !== undefined ? aboutHeroSubtitle : (current.about_hero_subtitle || DEFAULT_SETTINGS.aboutHeroSubtitle);
      const finalAboutHeroImage = aboutHeroImage !== undefined ? aboutHeroImage : (current.about_hero_image || DEFAULT_SETTINGS.aboutHeroImage);
      const finalAboutBadge = aboutBadge !== undefined ? aboutBadge : (current.about_badge || DEFAULT_SETTINGS.aboutBadge);
      const finalAboutHeading = aboutHeading !== undefined ? aboutHeading : (current.about_heading || DEFAULT_SETTINGS.aboutHeading);
      const finalAboutP1 = aboutStoryP1 !== undefined ? aboutStoryP1 : (current.about_story_p1 || DEFAULT_SETTINGS.aboutStoryP1);
      const finalAboutP2 = aboutStoryP2 !== undefined ? aboutStoryP2 : (current.about_story_p2 || DEFAULT_SETTINGS.aboutStoryP2);
      const finalAboutP3 = aboutStoryP3 !== undefined ? aboutStoryP3 : (current.about_story_p3 || DEFAULT_SETTINGS.aboutStoryP3);
      const finalAboutImg1 = aboutImg1 !== undefined ? aboutImg1 : (current.about_img_1 || DEFAULT_SETTINGS.aboutImg1);
      const finalAboutImg2 = aboutImg2 !== undefined ? aboutImg2 : (current.about_img_2 || DEFAULT_SETTINGS.aboutImg2);
      const finalAboutVision = aboutVision !== undefined ? aboutVision : (current.about_vision || DEFAULT_SETTINGS.aboutVision);
      const finalAboutMission = aboutMission !== undefined ? aboutMission : (current.about_mission || DEFAULT_SETTINGS.aboutMission);
      const finalAboutTimeSub = aboutTimelineSubtitle !== undefined ? aboutTimelineSubtitle : (current.about_timeline_subtitle || DEFAULT_SETTINGS.aboutTimelineSubtitle);
      const finalAboutTimeTitle = aboutTimelineTitle !== undefined ? aboutTimelineTitle : (current.about_timeline_title || DEFAULT_SETTINGS.aboutTimelineTitle);
      const finalAboutTimeline = aboutTimeline !== undefined ? (typeof aboutTimeline === 'string' ? aboutTimeline : JSON.stringify(aboutTimeline)) : (current.about_timeline ? (typeof current.about_timeline === 'string' ? current.about_timeline : JSON.stringify(current.about_timeline)) : JSON.stringify(DEFAULT_SETTINGS.aboutTimeline));
      const finalAboutTeamSub = aboutTeamSubtitle !== undefined ? aboutTeamSubtitle : (current.about_team_subtitle || DEFAULT_SETTINGS.aboutTeamSubtitle);
      const finalAboutTeamTitle = aboutTeamTitle !== undefined ? aboutTeamTitle : (current.about_team_title || DEFAULT_SETTINGS.aboutTeamTitle);

      try {
        await sql`
          INSERT INTO settings (
            id, phone_front_desk, phone_reservations, email_info, email_booking, whatsapp, address, passcode,
            testimonials_subtitle, testimonials_title,
            about_hero_title, about_hero_subtitle, about_hero_image,
            about_badge, about_heading, about_story_p1, about_story_p2, about_story_p3,
            about_img_1, about_img_2, about_vision, about_mission,
            about_timeline_subtitle, about_timeline_title, about_timeline,
            about_team_subtitle, about_team_title
          )
          VALUES (
            'global', ${finalPhoneDesk}, ${finalPhoneRes}, ${finalEmailInfo}, ${finalEmailBook}, ${finalWhatsapp}, ${finalAddress}, ${finalPasscode},
            ${finalTestSub}, ${finalTestTitle},
            ${finalAboutHeroTitle}, ${finalAboutHeroSubtitle}, ${finalAboutHeroImage},
            ${finalAboutBadge}, ${finalAboutHeading}, ${finalAboutP1}, ${finalAboutP2}, ${finalAboutP3},
            ${finalAboutImg1}, ${finalAboutImg2}, ${finalAboutVision}, ${finalAboutMission},
            ${finalAboutTimeSub}, ${finalAboutTimeTitle}, ${finalAboutTimeline}::jsonb,
            ${finalAboutTeamSub}, ${finalAboutTeamTitle}
          )
          ON CONFLICT (id) DO UPDATE SET
            phone_front_desk = EXCLUDED.phone_front_desk,
            phone_reservations = EXCLUDED.phone_reservations,
            email_info = EXCLUDED.email_info,
            email_booking = EXCLUDED.email_booking,
            whatsapp = EXCLUDED.whatsapp,
            address = EXCLUDED.address,
            passcode = EXCLUDED.passcode,
            testimonials_subtitle = EXCLUDED.testimonials_subtitle,
            testimonials_title = EXCLUDED.testimonials_title,
            about_hero_title = EXCLUDED.about_hero_title,
            about_hero_subtitle = EXCLUDED.about_hero_subtitle,
            about_hero_image = EXCLUDED.about_hero_image,
            about_badge = EXCLUDED.about_badge,
            about_heading = EXCLUDED.about_heading,
            about_story_p1 = EXCLUDED.about_story_p1,
            about_story_p2 = EXCLUDED.about_story_p2,
            about_story_p3 = EXCLUDED.about_story_p3,
            about_img_1 = EXCLUDED.about_img_1,
            about_img_2 = EXCLUDED.about_img_2,
            about_vision = EXCLUDED.about_vision,
            about_mission = EXCLUDED.about_mission,
            about_timeline_subtitle = EXCLUDED.about_timeline_subtitle,
            about_timeline_title = EXCLUDED.about_timeline_title,
            about_timeline = EXCLUDED.about_timeline,
            about_team_subtitle = EXCLUDED.about_team_subtitle,
            about_team_title = EXCLUDED.about_team_title
        `;
      } catch (colErr) {
        // Fallback in case of old table structure
        await sql`
          INSERT INTO settings (id, phone_front_desk, phone_reservations, email_info, email_booking, whatsapp, address, passcode)
          VALUES ('global', ${finalPhoneDesk}, ${finalPhoneRes}, ${finalEmailInfo}, ${finalEmailBook}, ${finalWhatsapp}, ${finalAddress}, ${finalPasscode})
          ON CONFLICT (id) DO UPDATE SET
            phone_front_desk = EXCLUDED.phone_front_desk,
            phone_reservations = EXCLUDED.phone_reservations,
            email_info = EXCLUDED.email_info,
            email_booking = EXCLUDED.email_booking,
            whatsapp = EXCLUDED.whatsapp,
            address = EXCLUDED.address,
            passcode = EXCLUDED.passcode
        `;
      }

      memorySettings = { ...memorySettings, ...req.body };
      saveLocalSettings(memorySettings);
      return res.status(200).json({ success: true, message: 'Settings saved successfully.' });
    } catch (error) {
      console.error('Error saving settings:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed.' });
}

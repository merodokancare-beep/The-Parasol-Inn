export const DEFAULT_ROOMS = [
  {
    id: "deluxe",
    name: "Deluxe Mountain View",
    tagline: "Scenic Escape",
    description: "Awake to panoramic vistas of the Kanchenjunga peaks right from your bedside. Designed with premium alpine wood paneling, warm colors, and heated floors, this room provides the ultimate cozy retreat after a day of sightseeing.",
    price: 4500,
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80",
    amenities: ["Private Balcony", "Premium Tea Maker", "43\" Smart LED TV", "Underbed Heating"],
    inventory: 5
  },
  {
    id: "premium",
    name: "Premium Balcony Suite",
    tagline: "Valley Vista",
    description: "Indulge in spacious alpine comfort. These rooms feature a separate glass-walled seating area, a large wooden balcony suspended over the misty valleys, premium coffee pod setup, and customized luxury bath cosmetics.",
    price: 6500,
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80",
    amenities: ["Large Wooden Deck", "Espresso Machine", "Minibar & Safe Box", "Deep Soak Bathtub"],
    inventory: 3
  },
  {
    id: "presidential",
    name: "Himalayan Presidential Suite",
    tagline: "Unparalleled Luxury",
    description: "Our flagship penthouse residence. Offers an extensive master bed, a private living lounge centered around a hand-carved stone fireplace, a vast panorama terrace with a heated cedar hot-tub, and personalized 24/7 butler service on demand.",
    price: 10500,
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80",
    amenities: ["Outdoor Jacuzzi Tub", "Wood Fireplace", "Personal Butler", "55\" UHD Smart Screen"],
    inventory: 1
  }
];

export const DEFAULT_GALLERY = [
  { id: "gal1", category: "rooms", image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80", title: "Deluxe Mountain View Room" },
  { id: "gal2", category: "dining", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80", title: "The Alpine Diner Restaurant" },
  { id: "gal3", category: "scenic", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80", title: "Kanchenjunga Golden Sunrise" },
  { id: "gal4", category: "rooms", image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80", title: "Premium Balcony Suite Bedroom" },
  { id: "gal5", category: "events", image: "https://images.unsplash.com/photo-1517502884422-41eaaced0168?auto=format&fit=crop&w=800&q=80", title: "Summit Hall Corporate Events" },
  { id: "gal6", category: "scenic", image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80", title: "Misty Garden Sit-out Lounge" },
  { id: "gal7", category: "dining", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80", title: "Resort Lounge & Cocktail Bar" },
  { id: "gal8", category: "rooms", image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80", title: "Himalayan Presidential Suite" },
  { id: "gal9", category: "scenic", image: "https://images.unsplash.com/photo-1626602411112-10742f9a3ab8?auto=format&fit=crop&w=800&q=80", title: "Misty Himalayan Pine Valley" }
];

export const DEFAULT_ATTRACTIONS = [
  {
    id: "att1",
    name: "Tsomgo Lake (Changu)",
    description: "Located at an altitude of 12,400 ft, this oval glacial lake is sacred to the Sikkimese. It exhibits beautiful color shifts across seasons—aquamarine in spring, misty green in monsoon, and frozen white ice in winter.",
    distance: "38 KM",
    driveTime: "Approx. 2 Hrs Drive",
    image: "https://images.unsplash.com/photo-1627664813838-5f57f59fb530?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "att2",
    name: "Nathula Pass",
    description: "An epic mountain pass on the Indo-Tibetan border at 14,140 ft. Offers panoramic mountain cliffs, snow slopes, and views of the historic Silk Route trade lines. (*Note: Requires special permit, which our desk can arrange in advance).",
    distance: "54 KM",
    driveTime: "Approx. 2.5 Hrs Drive",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "att3",
    name: "Rumtek Monastery",
    description: "One of the largest, most significant Buddhist monasteries in Sikkim. Acts as the main seat of the Karma Kagyu lineage. Features ornate golden spires, vibrant murals, Buddhist scriptures, and serene surrounding pine valleys.",
    distance: "22 KM",
    driveTime: "Approx. 1 Hr Drive",
    image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "att4",
    name: "Gangtok Ropeway",
    description: "A popular double-cable ropeway that glides above Gangtok city. Offers spectacular bird's-eye views of the urban hills, deep gorges, flowing rivers, and far-off valleys on clear sunny days.",
    distance: "4 KM",
    driveTime: "15 Mins Drive",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80"
  }
];

export const DEFAULT_TESTIMONIALS = [
  {
    id: "test1",
    quote: "Absolutely breathtaking! Waking up to Kanchenjunga directly from our Premium Balcony Suite was an experience of a lifetime. The staff was incredibly warm and served authentic Sikkimese tea upon arrival. Highly recommended!",
    author: "Rajesh Sharma",
    location: "New Delhi",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    status: "approved",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  },
  {
    id: "test2",
    quote: "The Tibet Wellness Spa here is pure bliss. We visited Sikkim for an anniversary trek, and ending our trip at the resort was the best decision. The wood fire lounge and dynamic dining were first-class.",
    author: "Sarah Jenkins",
    location: "United Kingdom",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    status: "approved",
    video_url: ""
  },
  {
    id: "test3",
    quote: "Superb hospitality and attention to detail. Fast Wi-Fi was useful for checking on work, and the parking arrangements were secure. The restaurant's traditional Momos and Thukpa are delicious!",
    author: "Anirudh Roy",
    location: "Kolkata",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    status: "approved",
    video_url: ""
  }
];

export const DEFAULT_SETTINGS = {
  id: "global",
  phoneFrontDesk: "+91 9246244599",
  phoneReservations: "+91 8348554599",
  emailInfo: "Passangbhutia298@gmail.com",
  emailBooking: "Passangbhutia298@gmail.com",
  whatsapp: "+919246244599",
  address: "The Parasol Inn, Swastik Gate, Upper Burtuk, Gangtok - 737101, Sikkim",
  passcode: "admin123",
  testimonialsSubtitle: "Guest Experiences",
  testimonialsTitle: "Whispers from the Hills",
  // About Us Page Fields
  aboutHeroTitle: "Our Story",
  aboutHeroSubtitle: "The Parasol Inn Sikkim",
  aboutHeroImage: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1920&q=80",
  aboutBadge: "Crafting hospitality since 2012",
  aboutHeading: "A Legacy of Himalayan Hospitality",
  aboutStoryP1: "The Parasol Inn Sikkim was conceptualized by a group of local travel professionals and hospitality veterans who wanted to design a luxury retreat that highlights the natural splendor of Gangtok without disturbing its peaceful ecosystem.",
  aboutStoryP2: "We pride ourselves on using locally-sourced volcanic stones, traditional alpine wood carvings, and working closely with local craftspeople. Over the last decade, our hotel has become a hallmark of premium accommodation in North-East India, accommodating travelers from all around the globe who seek to explore Sikkim's heritage, monasteries, and peaks.",
  aboutStoryP3: "Our commitment remains simple: providing a warm, modern sanctuary where guests arrive as travelers, and leave as members of our extended alpine family.",
  aboutImg1: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
  aboutImg2: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80",
  aboutVision: "To establish The Parasol Inn Sikkim as the premier luxury eco-hotel in the Eastern Himalayas, setting benchmarks for sustainable boutique tourism, high-end comfort, and authentic cultural hospitality.",
  aboutMission: "To provide exceptional, immersive mountain experiences for our guests while preserving Sikkim's pristine environment and supporting local communities through fair-wage employment and heritage conservation projects.",
  aboutTimelineSubtitle: "Our Milestones",
  aboutTimelineTitle: "Journey Through Years",
  aboutTimeline: [
    {
      year: "2012",
      title: "The Foundation",
      description: "Purchased the alpine forest edge land in Gangtok and laid down the foundation stones. Designed by architect Pema Lhatso using eco-sustainable volcanic materials."
    },
    {
      year: "2014",
      title: "Grand Opening",
      description: "Opened our doors to the public with 15 deluxe rooms, a traditional dining lounge, and spectacular views of the snow-clad peaks."
    },
    {
      year: "2018",
      title: "Expansion & Wellness Spa",
      description: "Added the Premium Balcony Suites wing and inaugurated the Tibet Wellness Spa, offering traditional hot-stone thermal treatments."
    },
    {
      year: "2023",
      title: "National Hospitality Award",
      description: "Awarded the \"Best Luxury Mountain Retreat in North-East India\" for outstanding service, green footprint, and high-end reviews."
    }
  ],
  aboutTeamSubtitle: "The Alpine Family",
  aboutTeamTitle: "Hotel Management Team"
};

export const DEFAULT_TEAM = [
  {
    id: "team_1",
    name: "Tenzing Norbu",
    role: "Founder & Managing Director",
    bio: "Born and raised in Gangtok, Tenzing dedicated over two decades to sustainable Himalayan ecotourism before establishing The Parasol Inn in 2012.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    display_order: 1
  },
  {
    id: "team_2",
    name: "Pema Dolma",
    role: "General Manager",
    bio: "With a background in international luxury hospitality management, Pema leads our daily guest experience team to deliver outstanding reviews.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    display_order: 2
  },
  {
    id: "team_3",
    name: "Tshering Tamang",
    role: "Executive Chef",
    bio: "Master Chef Tshering crafts our local Himalayan delicacies, Momos, and fusion menus using ingredients sourced directly from village farms.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    display_order: 3
  }
];


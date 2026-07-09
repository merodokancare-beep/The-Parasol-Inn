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
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "test2",
    quote: "The Tibet Wellness Spa here is pure bliss. We visited Sikkim for an anniversary trek, and ending our trip at the resort was the best decision. The wood fire lounge and dynamic dining were first-class.",
    author: "Sarah Jenkins",
    location: "United Kingdom",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "test3",
    quote: "Superb hospitality and attention to detail. Fast Wi-Fi was useful for checking on work, and the parking arrangements were secure. The restaurant's traditional Momos and Thukpa are delicious!",
    author: "Anirudh Roy",
    location: "Kolkata",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
  }
];

export const DEFAULT_SETTINGS = {
  id: "global",
  phoneFrontDesk: "+91 3592 202202",
  phoneReservations: "+91 98765 43210",
  emailInfo: "info@theparasolinnsikkim.com",
  emailBooking: "booking@theparasolinnsikkim.com",
  whatsapp: "+919876543210",
  address: "The Parasol Inn Sikkim, Near Ridge Park, Gangtok, Sikkim - 737101, India",
  passcode: "admin123"
};

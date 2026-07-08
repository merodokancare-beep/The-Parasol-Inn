document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Database Schema
    initDatabase();

    // Auto-checkout past bookings
    autoCheckOutPastBookings();

    // 2. Render Dynamic Components across Pages
    renderDynamicContent();

    // 3. Initialize Theme Toggle
    initThemeToggle();

    // 4. Initialize Mobile Navigation
    initMobileNav();

    // 5. Initialize Hero Slider (if exists)
    initHeroSlider();

    // 6. Initialize Testimonial Slider (if exists)
    initTestimonialSlider();

    // 7. Initialize Gallery Filters and Lightbox (if exists)
    initGallery();

    // 8. Initialize Tariff Calculator (if exists)
    initTariffCalculator();

    // 9. Initialize Enquiry Form Handlers
    initForms();

    // 10. Setup active state for current page nav link
    setupActiveNavLink();
});

/* ==========================================
   CLIENT-SIDE MOCK DATABASE SCHEMA & SEED
   ========================================== */
const DEFAULT_ROOMS = [
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

const DEFAULT_GALLERY = [
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

const DEFAULT_ATTRACTIONS = [
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

const DEFAULT_TESTIMONIALS = [
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

const DEFAULT_SETTINGS = {
    phoneFrontDesk: "+91 3592 202202",
    phoneReservations: "+91 98765 43210",
    emailInfo: "info@theparasolinnsikkim.com",
    emailBooking: "booking@theparasolinnsikkim.com",
    whatsapp: "+919876543210",
    address: "The Parasol Inn Sikkim, Near Ridge Park, Gangtok, Sikkim - 737101, India",
    passcode: "admin123"
};

function initDatabase() {
    if (!localStorage.getItem('hotel_rooms')) {
        localStorage.setItem('hotel_rooms', JSON.stringify(DEFAULT_ROOMS));
    } else {
        // Enforce inventory field in existing data schema
        try {
            let rooms = JSON.parse(localStorage.getItem('hotel_rooms')) || [];
            let modified = false;
            rooms.forEach(r => {
                if (r.inventory === undefined) {
                    const defaultRoom = DEFAULT_ROOMS.find(d => d.id === r.id);
                    r.inventory = defaultRoom ? defaultRoom.inventory : 3;
                    modified = true;
                }
            });
            if (modified) {
                localStorage.setItem('hotel_rooms', JSON.stringify(rooms));
            }
        } catch (e) {
            console.error("Schema patch failed", e);
        }
    }
    if (!localStorage.getItem('hotel_gallery')) {
        localStorage.setItem('hotel_gallery', JSON.stringify(DEFAULT_GALLERY));
    }
    if (!localStorage.getItem('hotel_attractions')) {
        localStorage.setItem('hotel_attractions', JSON.stringify(DEFAULT_ATTRACTIONS));
    }
    if (!localStorage.getItem('hotel_testimonials')) {
        localStorage.setItem('hotel_testimonials', JSON.stringify(DEFAULT_TESTIMONIALS));
    }
    if (!localStorage.getItem('hotel_settings')) {
        localStorage.setItem('hotel_settings', JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem('hotel_enquiries')) {
        localStorage.setItem('hotel_enquiries', JSON.stringify([]));
    }
}

/* ==========================================
   DYNAMIC INVENTORY & RESERVATION HELPERS
   ========================================== */
function isDateRangeOverlapping(start1, end1, start2, end2) {
    const s1 = new Date(start1);
    const e1 = new Date(end1);
    const s2 = new Date(start2);
    const e2 = new Date(end2);
    return (s1 < e2) && (s2 < e1);
}

function getRoomAvailability(roomId, checkin, checkout) {
    const rooms = JSON.parse(localStorage.getItem('hotel_rooms')) || DEFAULT_ROOMS;
    const room = rooms.find(r => r.id === roomId);
    if (!room) return 0;
    const totalInventory = parseInt(room.inventory) || 5;

    if (!checkin || !checkout) return totalInventory;

    const enquiries = JSON.parse(localStorage.getItem('hotel_enquiries')) || [];
    
    // Filter active bookings matching room type that overlap dates
    const activeOverlaps = enquiries.filter(b => {
        // Only count Confirmed bookings against available inventory
        if (b.status !== 'Confirmed') return false;
        
        // Match room category either by exact ID or original name
        const roomTypeMatch = (b.roomType === room.name || b.roomType === room.id || (b.room_type && b.room_type === room.id));
        if (!roomTypeMatch) return false;

        return isDateRangeOverlapping(b.checkin, b.checkout, checkin, checkout);
    });

    return Math.max(0, totalInventory - activeOverlaps.length);
}

function autoCheckOutPastBookings() {
    try {
        const enquiries = JSON.parse(localStorage.getItem('hotel_enquiries')) || [];
        const today = new Date().toISOString().split('T')[0];
        let modified = false;

        enquiries.forEach(b => {
            if ((b.status === 'Confirmed' || b.status === 'Pending') && b.checkout < today) {
                b.status = 'Completed';
                modified = true;
            }
        });

        if (modified) {
            localStorage.setItem('hotel_enquiries', JSON.stringify(enquiries));
        }
    } catch (e) {
        console.error("Auto checkout failed", e);
    }
}

/* ==========================================
   DYNAMIC PAGE RENDERERS
   ========================================== */
function renderDynamicContent() {
    const rooms = JSON.parse(localStorage.getItem('hotel_rooms')) || DEFAULT_ROOMS;
    const gallery = JSON.parse(localStorage.getItem('hotel_gallery')) || DEFAULT_GALLERY;
    const attractions = JSON.parse(localStorage.getItem('hotel_attractions')) || DEFAULT_ATTRACTIONS;
    const testimonials = JSON.parse(localStorage.getItem('hotel_testimonials')) || DEFAULT_TESTIMONIALS;
    const settings = JSON.parse(localStorage.getItem('hotel_settings')) || DEFAULT_SETTINGS;

    // 1. Update Global Header/Footer Info
    updateGlobalContactInfo(settings);

    // 2. Render Rooms Catalog Page (rooms.html)
    const catalogContainer = document.querySelector('.rooms-catalog-list');
    if (catalogContainer) {
        catalogContainer.innerHTML = '';
        rooms.forEach(room => {
            const card = document.createElement('div');
            card.className = 'room-wide-card';
            card.id = `room-${room.id}`;
            
            const amenitiesHTML = room.amenities.map(amenity => `
                <span><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/></svg> ${amenity}</span>
            `).join('');

            card.innerHTML = `
                <div class="room-wide-img">
                    <img src="${room.image}" alt="${room.name} Setup">
                </div>
                <div class="room-wide-info">
                    <div>
                        <div class="room-details-title">${room.tagline}</div>
                        <h3>${room.name}</h3>
                        <p class="room-wide-desc">${room.description}</p>
                        <div class="room-wide-amenities-grid">
                            ${amenitiesHTML}
                        </div>
                    </div>
                    <div class="room-wide-footer">
                        <div class="room-price">
                            <span>₹${room.price.toLocaleString('en-IN')}</span>
                            <label>Per Night (Excl. Taxes)</label>
                        </div>
                        <a href="#calculator" class="btn btn-primary" data-room-id="${room.id}">Estimate Tariff</a>
                    </div>
                </div>
            `;
            catalogContainer.appendChild(card);
        });

        // Add event listeners to "Estimate Tariff" buttons
        catalogContainer.querySelectorAll('a[href="#calculator"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const roomId = btn.getAttribute('data-room-id');
                const calcSelect = document.getElementById('calc-room-type');
                if (calcSelect) {
                    calcSelect.value = roomId;
                    calcSelect.dispatchEvent(new Event('change'));
                }
            });
        });
    }

    // 3. Render Tariff Dropdowns & Options
    const calcSelect = document.getElementById('calc-room-type');
    if (calcSelect) {
        calcSelect.innerHTML = '';
        rooms.forEach(room => {
            const opt = document.createElement('option');
            opt.value = room.id;
            opt.textContent = `${room.name} (₹${room.price.toLocaleString('en-IN')}/night)`;
            calcSelect.appendChild(opt);
        });
    }

    // Homepage booking select option loader
    const bookingSelect = document.getElementById('booking-room-type');
    if (bookingSelect) {
        bookingSelect.innerHTML = '<option value="" disabled selected>Select Room</option>';
        rooms.forEach(room => {
            const opt = document.createElement('option');
            opt.value = room.id;
            opt.textContent = room.name;
            bookingSelect.appendChild(opt);
        });
    }

    // Contact page enquiry select option loader
    const enquirySelect = document.getElementById('enquiry-room-type');
    if (enquirySelect) {
        enquirySelect.innerHTML = '<option value="" disabled selected>Select Category</option>';
        rooms.forEach(room => {
            const opt = document.createElement('option');
            opt.value = room.id;
            opt.textContent = room.name;
            enquirySelect.appendChild(opt);
        });
    }

    // 4. Render Homepage Featured Teaser Rooms (index.html)
    const teaserGrid = document.querySelector('.rooms-teaser-grid');
    if (teaserGrid) {
        teaserGrid.innerHTML = '';
        // Slice first 3 rooms to avoid overflowing homepage grid
        rooms.slice(0, 3).forEach((room, idx) => {
            const card = document.createElement('div');
            card.className = 'room-card';

            const badges = ["Popular", "Luxury", "Exclusive"];
            const badge = room.tagline || badges[idx % badges.length];

            // Render first two amenities
            const amenitiesHTML = room.amenities.slice(0, 2).map(amenity => `
                <span class="r-amenity">
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="currentColor"/></svg>
                    ${amenity}
                </span>
            `).join('');

            card.innerHTML = `
                <div class="room-card-img">
                    <img src="${room.image}" alt="${room.name}">
                    <span class="room-badge">${badge}</span>
                </div>
                <div class="room-card-content">
                    <h3>${room.name}</h3>
                    <p>${room.description.length > 120 ? room.description.substring(0, 117) + '...' : room.description}</p>
                    <div class="room-card-amenities">
                        ${amenitiesHTML}
                    </div>
                    <div class="room-card-footer">
                        <div class="room-price">
                            <span>₹${room.price.toLocaleString('en-IN')}</span>
                            <label>/ Night</label>
                        </div>
                        <a href="rooms.html" class="btn btn-secondary" style="padding: 8px 16px; font-size: 0.8rem;">Details</a>
                    </div>
                </div>
            `;
            teaserGrid.appendChild(card);
        });
    }

    // 5. Render Testimonials Section (index.html)
    const testimonialSlider = document.getElementById('testimonial-slider');
    if (testimonialSlider) {
        testimonialSlider.innerHTML = '';
        testimonials.forEach(test => {
            const slide = document.createElement('div');
            slide.className = 'testimonial-slide';
            slide.innerHTML = `
                <svg class="quote-icon" viewBox="0 0 24 24"><path d="M13 14.725c0-5.141 3.892-10.519 10-11.725l.944 2c-4.437 1.286-6.944 4.248-6.944 6.725h6v9h-10v-6zm-13 0c0-5.141 3.892-10.519 10-11.725l.944 2c-4.437 1.286-6.944 4.248-6.944 6.725h6v9h-10v-6z" fill="currentColor"/></svg>
                <p>"${test.quote}"</p>
                <div class="testimonial-author">
                    <img src="${test.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}" alt="${test.author}">
                    <h4>${test.author}</h4>
                    <span>${test.location}</span>
                </div>
            `;
            testimonialSlider.appendChild(slide);
        });
    }

    // 6. Render Dynamic Gallery Grid (gallery.html)
    const galleryGrid = document.querySelector('.gallery-grid');
    if (galleryGrid) {
        galleryGrid.innerHTML = '';
        gallery.forEach(item => {
            const node = document.createElement('div');
            node.className = `gallery-item ${item.category}`;
            node.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <div class="gallery-item-hover-content">
                    <svg viewBox="0 0 24 24"><path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0-2a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/></svg>
                    <h4>${item.title}</h4>
                </div>
            `;
            galleryGrid.appendChild(node);
        });
    }

    // 7. Render Dynamic Attractions (attractions.html)
    const attractionsGrid = document.querySelector('.attractions-grid');
    if (attractionsGrid) {
        attractionsGrid.innerHTML = '';
        attractions.forEach(att => {
            const card = document.createElement('div');
            card.className = 'attraction-card';
            card.innerHTML = `
                <div class="attraction-img">
                    <img src="${att.image}" alt="${att.name}">
                </div>
                <div class="attraction-details">
                    <div>
                        <h3>${att.name}</h3>
                        <p>${att.description}</p>
                    </div>
                    <div class="attraction-distance-meta">
                        <span>
                            <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/></svg>
                            ${att.distance}
                        </span>
                        <span>
                            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 11h-4V7h2v4h2v2z" fill="currentColor"/></svg>
                            ${att.driveTime}
                        </span>
                    </div>
                </div>
            `;
            attractionsGrid.appendChild(card);
        });
    }

    // 8. Inject Admin Link in Footer (Subtle)
    const footerLinksLists = document.querySelectorAll('.footer-links');
    if (footerLinksLists.length >= 2) {
        const helpInfoCol = footerLinksLists[1];
        if (helpInfoCol && !helpInfoCol.querySelector('a[href="admin.html"]')) {
            const adminLi = document.createElement('li');
            adminLi.innerHTML = '<a href="admin.html" style="opacity: 0.6; font-size: 0.85rem;">Admin Portal</a>';
            helpInfoCol.appendChild(adminLi);
        }
    }
}

function updateGlobalContactInfo(settings) {
    // 1. Float Action links (WhatsApp & Phone Call)
    const whatsappFloat = document.querySelector('#floating-contact .float-whatsapp');
    if (whatsappFloat && settings.whatsapp) {
        const text = encodeURIComponent("Hi! I'm interested in booking a room at The Parasol Inn Sikkim.");
        whatsappFloat.href = `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${text}`;
    }
    const phoneFloat = document.querySelector('#floating-contact .float-phone');
    if (phoneFloat && settings.phoneReservations) {
        phoneFloat.href = `tel:${settings.phoneReservations.replace(/[^0-9+]/g, '')}`;
    }

    // 2. Contact Page Details (contact.html)
    const addressEl = document.querySelector('.contact-info-panel .contact-detail-item:nth-child(1) p');
    if (addressEl && settings.address) {
        addressEl.innerHTML = settings.address.replace(/,/g, ',<br>');
    }
    const phoneEl = document.querySelector('.contact-info-panel .contact-detail-item:nth-child(2) p');
    if (phoneEl && settings.phoneFrontDesk && settings.phoneReservations) {
        phoneEl.innerHTML = `Front Desk: ${settings.phoneFrontDesk}<br>Reservations: ${settings.phoneReservations}`;
    }
    const emailEl = document.querySelector('.contact-info-panel .contact-detail-item:nth-child(3) p');
    if (emailEl && settings.emailInfo && settings.emailBooking) {
        emailEl.innerHTML = `${settings.emailInfo}<br>${settings.emailBooking}`;
    }
}

/* ==========================================
   GLOBAL THEME TOGGLE
   ========================================== */
function initThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;

    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.body.classList.add('dark-mode');
    }

    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const currentMode = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', currentMode);
    });
}

/* ==========================================
   MOBILE NAVIGATION
   ========================================== */
function initMobileNav() {
    const menuBtn = document.getElementById('menu-btn');
    const navMenu = document.getElementById('nav-menu');
    
    if (!menuBtn || !navMenu) return;

    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navMenu.classList.toggle('active');
        const spans = menuBtn.querySelectorAll('span');
        if (navMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !menuBtn.contains(e.target) && navMenu.classList.contains('active')) {
            menuBtn.click();
        }
    });
}

/* ==========================================
   ACTIVE NAVIGATION LINK
   ========================================== */
function setupActiveNavLink() {
    const path = window.location.pathname;
    const pageName = path.split('/').pop() || 'index.html';
    
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === pageName || (pageName === 'index.html' && href === './') || (pageName === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/* ==========================================
   HERO BANNER SLIDER
   ========================================== */
function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length === 0) return;

    let currentSlide = 0;
    const slideInterval = 5000;

    function nextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    setInterval(nextSlide, slideInterval);
}

/* ==========================================
   TESTIMONIALS SLIDER
   ========================================== */
function initTestimonialSlider() {
    const slider = document.querySelector('.testimonial-slider');
    const slides = document.querySelectorAll('.testimonial-slide');
    const dotsContainer = document.querySelector('.slider-dots');
    
    if (!slider || slides.length === 0) return;

    let currentIndex = 0;
    const intervalTime = 6000;
    let slideTimer;

    // Clear previous dots if any (e.g. from dynamic re-render)
    if (dotsContainer) dotsContainer.innerHTML = '';

    // Create dots
    slides.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.classList.add('slider-dot');
        if (idx === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
        dot.addEventListener('click', () => {
            goToSlide(idx);
            resetTimer();
        });
        if (dotsContainer) dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.slider-dot');

    function goToSlide(index) {
        currentIndex = index;
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentIndex);
        });
    }

    function autoSlide() {
        if (slides.length === 0) return;
        const nextIndex = (currentIndex + 1) % slides.length;
        goToSlide(nextIndex);
    }

    function startTimer() {
        slideTimer = setInterval(autoSlide, intervalTime);
    }

    function resetTimer() {
        clearInterval(slideTimer);
        startTimer();
    }

    startTimer();
}

/* ==========================================
   GALLERY FILTERS & CUSTOM LIGHTBOX
   ========================================== */
function initGallery() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    
    if (galleryItems.length === 0) return;

    // --- GALLERY FILTER LOGIC ---
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.classList.contains(filterValue)) {
                    item.style.display = 'block';
                    setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'scale(1)'; }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => { item.style.display = 'none'; }, 300);
                }
            });
        });
    });

    // --- LIGHTBOX LOGIC ---
    if (!lightbox) return;

    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    
    let currentImageSet = [];
    let currentImgIndex = 0;

    // Gather currently visible gallery images
    function getVisibleImages() {
        return Array.from(galleryItems).filter(item => item.style.display !== 'none');
    }

    // Event delegation or direct binding depending on dynamic load
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            currentImageSet = getVisibleImages();
            currentImgIndex = currentImageSet.indexOf(item);
            openLightbox(item);
        });
    });

    function openLightbox(item) {
        const img = item.querySelector('img');
        const title = item.querySelector('h4').textContent;
        
        lightboxImg.src = img.src;
        lightboxCaption.textContent = title;
        
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showPrevImage() {
        if (currentImageSet.length <= 1) return;
        currentImgIndex = (currentImgIndex - 1 + currentImageSet.length) % currentImageSet.length;
        const prevItem = currentImageSet[currentImgIndex];
        lightboxImg.src = prevItem.querySelector('img').src;
        lightboxCaption.textContent = prevItem.querySelector('h4').textContent;
    }

    function showNextImage() {
        if (currentImageSet.length <= 1) return;
        currentImgIndex = (currentImgIndex + 1) % currentImageSet.length;
        const nextItem = currentImageSet[currentImgIndex];
        lightboxImg.src = nextItem.querySelector('img').src;
        lightboxCaption.textContent = nextItem.querySelector('h4').textContent;
    }

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', showPrevImage);
    nextBtn.addEventListener('click', showNextImage);
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showPrevImage();
        if (e.key === 'ArrowRight') showNextImage();
    });
}

/* ==========================================
   DYNAMIC TARIFF CALCULATOR
   ========================================== */
function initTariffCalculator() {
    const calcForm = document.getElementById('tariff-calc-form');
    if (!calcForm) return;

    const roomSelect = document.getElementById('calc-room-type');
    const checkinInput = document.getElementById('calc-check-in');
    const checkoutInput = document.getElementById('calc-check-out');
    const guestsInput = document.getElementById('calc-guests');

    const displayBase = document.getElementById('calc-display-base');
    const displayGuests = document.getElementById('calc-display-guests');
    const displayTotal = document.getElementById('calc-display-total');
    const breakdownNights = document.getElementById('calc-breakdown-nights');
    const breakdownGuests = document.getElementById('calc-breakdown-guests');

    const rooms = JSON.parse(localStorage.getItem('hotel_rooms')) || DEFAULT_ROOMS;
    const prices = {};
    rooms.forEach(r => {
        prices[r.id] = { base: r.price, label: r.name };
    });

    const extraGuestFee = 1000;

    const today = new Date().toISOString().split('T')[0];
    checkinInput.min = today;
    checkinInput.addEventListener('change', () => {
        checkoutInput.min = checkinInput.value;
    });

    function calculateTariff() {
        const roomType = roomSelect.value;
        const checkinVal = checkinInput.value;
        const checkoutVal = checkoutInput.value;
        const guests = parseInt(guestsInput.value) || 1;

        if (!roomType || !prices[roomType] || !checkinVal || !checkoutVal) {
            displayTotal.innerHTML = '₹0 <label>Enter dates and select a room</label>';
            return;
        }

        const date1 = new Date(checkinVal);
        const date2 = new Date(checkoutVal);
        const diffTime = Math.abs(date2 - date1);
        const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

        const baseNightPrice = prices[roomType].base;
        const totalBase = baseNightPrice * nights;
        
        let totalExtraGuests = 0;
        if (guests > 2) {
            const extraCount = guests - 2;
            totalExtraGuests = extraCount * extraGuestFee * nights;
        }

        const grandTotal = totalBase + totalExtraGuests;

        // Availability Calculation
        const avail = getRoomAvailability(roomType, checkinVal, checkoutVal);
        let availHTML = '';
        const calcForm = document.getElementById('tariff-calc-form');
        const proceedBtn = calcForm ? calcForm.querySelector('button') : null;

        if (avail <= 0) {
            availHTML = `<span style="display:block; color:var(--error); font-size:0.85rem; font-weight:600; margin-top:8px;">❌ Sold Out for these dates</span>`;
            if (proceedBtn) {
                proceedBtn.disabled = true;
                proceedBtn.style.opacity = '0.5';
                proceedBtn.style.cursor = 'not-allowed';
                proceedBtn.textContent = 'Sold Out';
            }
        } else {
            availHTML = `<span style="display:block; color:var(--success); font-size:0.85rem; font-weight:600; margin-top:8px;">✅ Available (${avail} left)</span>`;
            if (proceedBtn) {
                proceedBtn.disabled = false;
                proceedBtn.style.opacity = '1';
                proceedBtn.style.cursor = 'pointer';
                proceedBtn.textContent = 'Proceed to Enquiry';
            }
        }

        displayTotal.innerHTML = `₹${grandTotal.toLocaleString('en-IN')} <label>Estimated Total</label>${availHTML}`;
        breakdownNights.textContent = `${nights} Night${nights > 1 ? 's' : ''} × ₹${baseNightPrice.toLocaleString('en-IN')}`;
        if (breakdownGuests) breakdownGuests.textContent = guests > 2 ? `₹${totalExtraGuests.toLocaleString('en-IN')}` : '₹0';
        
        if (displayBase) displayBase.textContent = `₹${totalBase.toLocaleString('en-IN')}`;
        if (displayGuests) displayGuests.textContent = `₹${totalExtraGuests.toLocaleString('en-IN')}`;

        const descNights = document.getElementById('calc-breakdown-details-nights');
        if (descNights) descNights.textContent = `${nights} Nights Base`;
        const descGuests = document.getElementById('calc-breakdown-details-guests');
        if (descGuests) descGuests.textContent = guests > 2 ? `Extra Guests (${guests - 2})` : 'Extra Guests';
    }

    roomSelect.addEventListener('change', calculateTariff);
    checkinInput.addEventListener('change', calculateTariff);
    checkoutInput.addEventListener('change', calculateTariff);
    guestsInput.addEventListener('change', calculateTariff);

    calculateTariff();
}

/* ==========================================
   FORMS HANDLING (WITH ENQUIRY DB LOGGING)
   ========================================== */
function initForms() {
    const checkinInputs = document.querySelectorAll('input[type="date"][id*="check-in"], input[type="date"][name*="checkin"]');
    const today = new Date().toISOString().split('T')[0];
    
    checkinInputs.forEach(inInput => {
        inInput.min = today;
        const container = inInput.closest('form') || document;
        const outInput = container.querySelector('input[type="date"][id*="check-out"], input[type="date"][name*="checkout"]');
        
        if (outInput) {
            inInput.addEventListener('change', () => {
                outInput.min = inInput.value;
            });
        }
    });

    // 1. Quick Booking search-bar handler (Redirection to contact.html)
    const quickBookingForm = document.getElementById('quick-booking-form');
    if (quickBookingForm) {
        const roomTypeSelect = document.getElementById('booking-room-type');
        let statusLabel = document.getElementById('quick-availability-status');
        if (roomTypeSelect && !statusLabel) {
            statusLabel = document.createElement('div');
            statusLabel.id = 'quick-availability-status';
            statusLabel.style.fontSize = '0.75rem';
            statusLabel.style.fontWeight = '600';
            statusLabel.style.marginTop = '4px';
            statusLabel.style.position = 'absolute';
            statusLabel.style.bottom = '-20px';
            statusLabel.style.left = '0';
            roomTypeSelect.parentNode.style.position = 'relative';
            roomTypeSelect.parentNode.appendChild(statusLabel);
        }

        function checkQuickAvailability() {
            const roomVal = document.getElementById('booking-room-type').value;
            const checkinVal = document.getElementById('booking-check-in').value;
            const checkoutVal = document.getElementById('booking-check-out').value;
            const submitBtn = quickBookingForm.querySelector('button[type="submit"]');

            if (!roomVal || !checkinVal || !checkoutVal) {
                if (statusLabel) statusLabel.innerHTML = '';
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.style.cursor = 'pointer';
                    submitBtn.textContent = 'Check Tariff';
                }
                return;
            }

            const avail = getRoomAvailability(roomVal, checkinVal, checkoutVal);
            if (statusLabel) {
                if (avail <= 0) {
                    statusLabel.innerHTML = `<span style="color:var(--error);">❌ Sold Out</span>`;
                    if (submitBtn) {
                        submitBtn.disabled = true;
                        submitBtn.style.opacity = '0.5';
                        submitBtn.style.cursor = 'not-allowed';
                        submitBtn.textContent = 'Sold Out';
                    }
                } else {
                    statusLabel.innerHTML = `<span style="color:var(--success);">✅ ${avail} room${avail > 1 ? 's' : ''} left</span>`;
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.style.opacity = '1';
                        submitBtn.style.cursor = 'pointer';
                        submitBtn.textContent = 'Check Tariff';
                    }
                }
            }
        }

        const triggers = [
            document.getElementById('booking-room-type'),
            document.getElementById('booking-check-in'),
            document.getElementById('booking-check-out')
        ];
        triggers.forEach(el => {
            if (el) el.addEventListener('change', checkQuickAvailability);
        });

        quickBookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const checkin = document.getElementById('booking-check-in').value;
            const checkout = document.getElementById('booking-check-out').value;
            const guests = document.getElementById('booking-guests').value;
            const roomType = document.getElementById('booking-room-type').value;

            // Check availability
            const avail = getRoomAvailability(roomType, checkin, checkout);
            if (avail <= 0) {
                alert("We are sorry! This room category is fully booked/sold out for the selected dates. Please try another room category or different dates.");
                return;
            }

            const urlParams = new URLSearchParams({ checkin, checkout, guests, roomType });
            window.location.href = `contact.html?${urlParams.toString()}`;
        });
    }

    // Pre-fill parameters on contact page load
    const contactForm = document.getElementById('enquiry-form');
    if (contactForm && window.location.search) {
        const params = new URLSearchParams(window.location.search);
        const checkin = params.get('checkin');
        const checkout = params.get('checkout');
        const guests = params.get('guests');
        const roomType = params.get('roomType');

        if (checkin) document.getElementById('enquiry-check-in').value = checkin;
        if (checkout) {
            const checkoutEl = document.getElementById('enquiry-check-out');
            checkoutEl.min = checkin;
            checkoutEl.value = checkout;
        }
        if (guests) document.getElementById('enquiry-guests').value = guests;
        if (roomType) document.getElementById('enquiry-room-type').value = roomType;
    }

    // Live availability warning indicator on contact page form
    if (contactForm) {
        const roomTypeSelect = document.getElementById('enquiry-room-type');
        let statusLabel = document.getElementById('enquiry-availability-status');
        if (roomTypeSelect && !statusLabel) {
            statusLabel = document.createElement('div');
            statusLabel.id = 'enquiry-availability-status';
            statusLabel.style.fontSize = '0.8rem';
            statusLabel.style.fontWeight = '600';
            statusLabel.style.marginTop = '4px';
            roomTypeSelect.parentNode.appendChild(statusLabel);
        }

        function checkEnquiryAvailability() {
            const roomVal = document.getElementById('enquiry-room-type').value;
            const checkinVal = document.getElementById('enquiry-check-in').value;
            const checkoutVal = document.getElementById('enquiry-check-out').value;
            const submitBtn = contactForm.querySelector('button[type="submit"]');

            if (!roomVal || !checkinVal || !checkoutVal) {
                if (statusLabel) statusLabel.innerHTML = '';
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.style.cursor = 'pointer';
                }
                return;
            }

            const avail = getRoomAvailability(roomVal, checkinVal, checkoutVal);
            if (statusLabel) {
                if (avail <= 0) {
                    statusLabel.innerHTML = `<span style="color:var(--error);">❌ Fully booked / Sold Out for these dates</span>`;
                    if (submitBtn) {
                        submitBtn.disabled = true;
                        submitBtn.style.opacity = '0.5';
                        submitBtn.style.cursor = 'not-allowed';
                    }
                } else {
                    statusLabel.innerHTML = `<span style="color:var(--success);">✅ Rooms Available (${avail} left)</span>`;
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.style.opacity = '1';
                        submitBtn.style.cursor = 'pointer';
                    }
                }
            }
        }

        const triggerEls = [
            document.getElementById('enquiry-room-type'),
            document.getElementById('enquiry-check-in'),
            document.getElementById('enquiry-check-out')
        ];
        triggerEls.forEach(el => {
            if (el) el.addEventListener('change', checkEnquiryAvailability);
        });

        // Trigger check on load after a short delay
        setTimeout(checkEnquiryAvailability, 150);
    }

    // 2. Form Enquiry Submission (intercept and save locally, then submit)
    if (contactForm) {
        const popupOverlay = document.getElementById('form-success-popup');
        const closePopupBtn = document.getElementById('close-popup-btn');

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Sending Enquiry...';
            submitBtn.disabled = true;

            const formData = new FormData(contactForm);

            // Collect guest and room details
            const name = formData.get('name');
            const email = formData.get('email');
            const phone = formData.get('phone');
            const checkin = formData.get('checkin');
            const checkout = formData.get('checkout');
            const guests = formData.get('guests');
            const roomType = formData.get('room_type');
            const message = formData.get('message');

            const rooms = JSON.parse(localStorage.getItem('hotel_rooms')) || DEFAULT_ROOMS;
            const chosenRoom = rooms.find(r => r.id === roomType);
            const roomName = chosenRoom ? chosenRoom.name : roomType;

            // Generate estimation for storage
            let estimatedCost = 0;
            if (chosenRoom && checkin && checkout) {
                const date1 = new Date(checkin);
                const date2 = new Date(checkout);
                const diffTime = Math.abs(date2 - date1);
                const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
                const extraCount = Math.max(0, (parseInt(guests) || 1) - 2);
                estimatedCost = (chosenRoom.price * nights) + (extraCount * 1000 * nights);
            }

            // Save to LocalStorage Enquiries Database
            const enquiries = JSON.parse(localStorage.getItem('hotel_enquiries')) || [];
            const newEnquiry = {
                id: 'enq_' + Date.now(),
                name,
                email,
                phone,
                checkin,
                checkout,
                guests,
                roomType: roomName,
                room_type: roomType, // Save room ID directly as well
                message,
                cost: estimatedCost,
                status: 'Pending',
                source: 'Online',
                date: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            enquiries.unshift(newEnquiry); // Add to beginning
            localStorage.setItem('hotel_enquiries', JSON.stringify(enquiries));

            // Generate receipt HTML
            const receiptHtml = `
                <div style="text-align: left; margin: 20px 0; font-size: 0.9rem; border-top: 1.5px solid var(--border-color); padding-top: 20px;">
                    <p style="margin-bottom: 8px;"><strong>Guest Name:</strong> ${name}</p>
                    <p style="margin-bottom: 8px;"><strong>Email:</strong> ${email}</p>
                    <p style="margin-bottom: 8px;"><strong>Mobile:</strong> ${phone}</p>
                    <p style="margin-bottom: 8px;"><strong>Room Category:</strong> ${roomName}</p>
                    <p style="margin-bottom: 8px;"><strong>Dates:</strong> ${checkin} to ${checkout}</p>
                    <p style="margin-bottom: 8px;"><strong>Guests Count:</strong> ${guests}</p>
                    ${estimatedCost > 0 ? `<p style="margin-bottom: 8px;"><strong>Estimated Tariff:</strong> ₹${estimatedCost.toLocaleString('en-IN')}</p>` : ''}
                    ${message ? `<p style="margin-bottom: 8px;"><strong>Special Notes:</strong> ${message}</p>` : ''}
                </div>
            `;

            const receiptContainer = document.getElementById('popup-receipt-details');

            // Web3Forms API submission
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            })
            .then(response => response.json())
            .then(data => {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;

                if (data.success) {
                    if (receiptContainer) receiptContainer.innerHTML = receiptHtml;
                    const statusHeader = document.getElementById('popup-status-header') || {textContent: ''};
                    statusHeader.textContent = 'Enquiry Sent Successfully!';
                    const statusMessage = document.getElementById('popup-status-message') || {textContent: ''};
                    statusMessage.textContent = 'Your booking request has been dispatched. The resort management team will review your dates and email you a confirmation details package shortly.';
                    
                    if (popupOverlay) popupOverlay.classList.add('active');
                    contactForm.reset();
                } else {
                    // Fallback local-only submission message
                    if (receiptContainer) receiptContainer.innerHTML = receiptHtml;
                    const statusHeader = document.getElementById('popup-status-header') || {textContent: ''};
                    statusHeader.textContent = 'Enquiry Logged Locally!';
                    const statusMessage = document.getElementById('popup-status-message') || {textContent: ''};
                    statusMessage.textContent = 'Saved in local enquiries. (Web3Forms API key is missing or invalid, check your keys. Web3Forms message: ' + data.message + ')';
                    
                    if (popupOverlay) popupOverlay.classList.add('active');
                }
            })
            .catch(error => {
                // Network error fallback (so it still shows recorded locally)
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
                if (receiptContainer) receiptContainer.innerHTML = receiptHtml;
                const statusHeader = document.getElementById('popup-status-header') || {textContent: ''};
                statusHeader.textContent = 'Enquiry Saved Locally!';
                const statusMessage = document.getElementById('popup-status-message') || {textContent: ''};
                statusMessage.textContent = 'Logged locally inside browser storage. However, we could not connect to Web3Forms to send email: ' + error.message;
                
                if (popupOverlay) popupOverlay.classList.add('active');
            });
        });

        if (closePopupBtn) {
            closePopupBtn.addEventListener('click', () => {
                if (popupOverlay) popupOverlay.classList.remove('active');
            });
            popupOverlay.addEventListener('click', (e) => {
                if (e.target === popupOverlay) {
                    if (popupOverlay) popupOverlay.classList.remove('active');
                }
            });
        }
    }
}

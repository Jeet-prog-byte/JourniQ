const bcrypt = require('bcryptjs');
const { getDb, saveDb } = require('./config/db');

async function seed() {
  console.log('🌱 Seeding JourniQ database...\n');
  const db = await getDb();

  // Clear existing data
  db.run("DELETE FROM reviews");
  db.run("DELETE FROM bookings");
  db.run("DELETE FROM packages");
  db.run("DELETE FROM users");

  // Create users
  const adminPass = await bcrypt.hash('admin123', 10);
  const demoPass = await bcrypt.hash('demo123', 10);

  db.run("INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)",
    ['Admin User', 'admin@journiq.com', adminPass, 'admin', '+91 9876543210']);
  db.run("INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)",
    ['Rahul Sharma', 'demo@journiq.com', demoPass, 'user', '+91 9876543211']);
  db.run("INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)",
    ['Priya Patel', 'priya@example.com', demoPass, 'user', '+91 9876543212']);

  console.log('✅ Users created');
  console.log('   Admin: admin@journiq.com / admin123');
  console.log('   Demo:  demo@journiq.com / demo123\n');

  // Travel Packages (INR pricing)
  const packages = [
    {
      title: 'Enchanting Bali Retreat',
      destination: 'Bali, Indonesia',
      description: 'Immerse yourself in the magical island of Bali. From ancient temples to pristine beaches, lush rice terraces to vibrant nightlife, experience the perfect blend of culture and relaxation. This all-inclusive package covers luxury villa stays, traditional spa treatments, and guided tours to the most iconic spots.',
      price: 45999,
      duration: 7,
      max_travelers: 20,
      category: 'beach',
      rating: 4.8,
      image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
        'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800',
        'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800',
        'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=800'
      ]),
      itinerary: JSON.stringify([
        { day: 1, title: 'Arrival & Welcome', description: 'Airport pickup, check-in to luxury villa, welcome dinner with traditional Balinese performance.' },
        { day: 2, title: 'Temple Tour', description: 'Visit Tanah Lot, Uluwatu Temple, and Tirta Empul. Enjoy cliff-top sunset dining.' },
        { day: 3, title: 'Rice Terraces & Culture', description: 'Explore Tegalalang Rice Terraces, coffee plantation visit, traditional cooking class.' },
        { day: 4, title: 'Beach Day', description: 'Relax at Nusa Dua beach, water sports, snorkeling, and beachside spa.' },
        { day: 5, title: 'Ubud Exploration', description: 'Monkey Forest, Ubud Art Market, traditional dance show, organic farm dinner.' },
        { day: 6, title: 'Adventure Day', description: 'White water rafting, jungle swing, waterfall trek, farewell dinner.' },
        { day: 7, title: 'Departure', description: 'Leisure morning, last-minute shopping, airport transfer.' }
      ]),
      included: JSON.stringify(['Luxury Villa Stay', 'All Meals', 'Airport Transfers', 'Guided Tours', 'Spa Treatment', 'Water Sports']),
      is_featured: 1
    },
    {
      title: 'Santorini Dreamscape',
      destination: 'Santorini, Greece',
      description: 'Discover the breathtaking beauty of Santorini with its iconic white-washed buildings, stunning sunsets, and crystal-clear Aegean waters. Explore charming villages, savor Mediterranean cuisine, and create unforgettable memories on this Greek island paradise.',
      price: 89999,
      duration: 6,
      max_travelers: 15,
      category: 'beach',
      rating: 4.9,
      image_url: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800',
        'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800',
        'https://images.unsplash.com/photo-1504512485720-7d83a16ee930?w=800',
        'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800'
      ]),
      itinerary: JSON.stringify([
        { day: 1, title: 'Arrival in Paradise', description: 'Welcome to Santorini! Transfer to your cave hotel in Oia, sunset welcome dinner.' },
        { day: 2, title: 'Oia Exploration', description: 'Walking tour of Oia, blue dome churches, art galleries, famous sunset viewing.' },
        { day: 3, title: 'Caldera Cruise', description: 'Catamaran cruise around the caldera, hot springs, Red Beach, BBQ on board.' },
        { day: 4, title: 'Wine & Culture', description: 'Wine tasting tour, ancient Akrotiri ruins, black sand beach visit.' },
        { day: 5, title: 'Fira & Thirassia', description: 'Explore Fira town, cable car ride, boat trip to Thirassia island.' },
        { day: 6, title: 'Departure', description: 'Leisurely breakfast, shopping, airport transfer.' }
      ]),
      included: JSON.stringify(['Cave Hotel Stay', 'Daily Breakfast', 'Catamaran Cruise', 'Wine Tasting', 'Airport Transfers', 'Walking Tours']),
      is_featured: 1
    },
    {
      title: 'Swiss Alps Adventure',
      destination: 'Interlaken, Switzerland',
      description: 'Experience the majestic Swiss Alps with this thrilling adventure package. From paragliding over snow-capped peaks to scenic train rides through alpine meadows, this trip combines adrenaline-pumping activities with the serene beauty of one of Europe\'s most stunning landscapes.',
      price: 125000,
      duration: 8,
      max_travelers: 12,
      category: 'mountain',
      rating: 4.7,
      image_url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800',
        'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=800',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=800'
      ]),
      itinerary: JSON.stringify([
        { day: 1, title: 'Arrival in Interlaken', description: 'Arrive in Zurich, scenic train to Interlaken, hotel check-in, town exploration.' },
        { day: 2, title: 'Jungfraujoch - Top of Europe', description: 'Train to Jungfraujoch (3,454m), ice palace, panoramic views, alpine lunch.' },
        { day: 3, title: 'Paragliding & Lake Cruise', description: 'Tandem paragliding over the Alps, afternoon cruise on Lake Thun.' },
        { day: 4, title: 'Grindelwald & First', description: 'First Cliff Walk, First Flyer zip line, mountain karting, alpine cheese tasting.' },
        { day: 5, title: 'Lauterbrunnen Valley', description: 'Visit 72 waterfalls, Trümmelbach Falls, Mürren village, Schilthorn peak.' },
        { day: 6, title: 'Adventure Sports', description: 'Choice of canyoning, bungee jumping, or white-water rafting, evening fondue dinner.' },
        { day: 7, title: 'Scenic Day', description: 'GoldenPass train ride, Montreux, Lake Geneva, farewell dinner.' },
        { day: 8, title: 'Departure', description: 'Breakfast, transfer to Zurich airport.' }
      ]),
      included: JSON.stringify(['4-Star Hotel', 'Daily Breakfast', 'Train Passes', 'Paragliding', 'Jungfraujoch Tour', 'Adventure Activity']),
      is_featured: 1
    },
    {
      title: 'Tokyo Cultural Odyssey',
      destination: 'Tokyo, Japan',
      description: 'Dive into the fascinating contrast of ancient traditions and futuristic innovation in Tokyo. From serene shrines and traditional tea ceremonies to the neon-lit streets of Shibuya and Akihabara, this package offers an unforgettable Japanese cultural experience.',
      price: 72999,
      duration: 7,
      max_travelers: 18,
      category: 'cultural',
      rating: 4.8,
      image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
        'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
        'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800',
        'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800'
      ]),
      itinerary: JSON.stringify([
        { day: 1, title: 'Welcome to Tokyo', description: 'Narita Airport pickup, bullet train intro, Shinjuku evening walk, ramen dinner.' },
        { day: 2, title: 'Traditional Tokyo', description: 'Senso-ji Temple, Meiji Shrine, traditional tea ceremony, kimono experience.' },
        { day: 3, title: 'Modern Marvels', description: 'Shibuya Crossing, Harajuku, Akihabara electronics district, Tokyo Tower.' },
        { day: 4, title: 'Mount Fuji Day Trip', description: 'Visit Mount Fuji 5th Station, Lake Kawaguchi, onsen (hot spring) experience.' },
        { day: 5, title: 'Food & Culture', description: 'Tsukiji Fish Market, sushi-making class, Odaiba, teamLab Borderless.' },
        { day: 6, title: 'Day Trip to Kamakura', description: 'Great Buddha, bamboo forest, coastal temple walks, seaside lunch.' },
        { day: 7, title: 'Departure', description: 'Last-minute shopping in Ginza, airport transfer.' }
      ]),
      included: JSON.stringify(['Boutique Hotel', 'Daily Breakfast', 'JR Pass', 'Cultural Activities', 'Sushi Class', 'Airport Transfers']),
      is_featured: 1
    },
    {
      title: 'Kerala Backwaters Bliss',
      destination: 'Kerala, India',
      description: 'Experience God\'s Own Country with this immersive Kerala package. Cruise through serene backwaters on a luxury houseboat, explore spice plantations in Munnar, spot wildlife in Periyar, and relax on the golden beaches of Kovalam. Includes authentic Ayurvedic spa treatments.',
      price: 24999,
      duration: 6,
      max_travelers: 25,
      category: 'cultural',
      rating: 4.6,
      image_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800',
        'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?w=800',
        'https://images.unsplash.com/photo-1609340667564-6a6d085a31e4?w=800',
        'https://images.unsplash.com/photo-1567157577867-05ccb1388e13?w=800'
      ]),
      itinerary: JSON.stringify([
        { day: 1, title: 'Arrival in Kochi', description: 'Airport pickup, Fort Kochi tour, Chinese fishing nets, spice market visit.' },
        { day: 2, title: 'Munnar Hill Station', description: 'Drive to Munnar, tea plantation tour, Eravikulam National Park, sunset point.' },
        { day: 3, title: 'Spice & Wildlife', description: 'Spice garden visit, Periyar Wildlife Sanctuary boat ride, tribal village tour.' },
        { day: 4, title: 'Alleppey Backwaters', description: 'Board luxury houseboat, cruise through backwaters, village walks, coir-making demo.' },
        { day: 5, title: 'Beach & Ayurveda', description: 'Transfer to Kovalam, beach relaxation, Ayurvedic spa session, lighthouse visit.' },
        { day: 6, title: 'Departure', description: 'Morning yoga, Trivandrum temple visit, airport transfer.' }
      ]),
      included: JSON.stringify(['Heritage Hotels', 'All Meals', 'Houseboat Cruise', 'Ayurvedic Spa', 'Wildlife Safari', 'Airport Transfers']),
      is_featured: 1
    },
    {
      title: 'Dubai Luxury Experience',
      destination: 'Dubai, UAE',
      description: 'Indulge in the opulence of Dubai with this luxury package. From the world\'s tallest building to desert safari adventures, experience the perfect fusion of modern luxury and Arabian heritage. Includes stay at a 5-star hotel with stunning views of the Dubai skyline.',
      price: 65999,
      duration: 5,
      max_travelers: 20,
      category: 'city',
      rating: 4.7,
      image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
        'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800',
        'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=800',
        'https://images.unsplash.com/photo-1526495124232-a04e1849168c?w=800'
      ]),
      itinerary: JSON.stringify([
        { day: 1, title: 'Arrival & City Lights', description: 'Airport pickup, hotel check-in, Dubai Marina walk, fountain show at Burj Khalifa.' },
        { day: 2, title: 'Modern Dubai', description: 'Burj Khalifa observation deck, Dubai Mall, aquarium, luxury yacht dinner cruise.' },
        { day: 3, title: 'Desert Adventure', description: 'Morning desert safari, dune bashing, camel ride, BBQ dinner under the stars.' },
        { day: 4, title: 'Heritage & Shopping', description: 'Old Dubai, Gold Souk, Spice Souk, Dubai Creek, Mall of the Emirates.' },
        { day: 5, title: 'Departure', description: 'Palm Jumeirah visit, Atlantis Aquaventure, airport transfer.' }
      ]),
      included: JSON.stringify(['5-Star Hotel', 'Daily Breakfast', 'Desert Safari', 'Yacht Cruise', 'Burj Khalifa Entry', 'Airport Transfers']),
      is_featured: 1
    },
    {
      title: 'Andaman Island Escape',
      destination: 'Port Blair, Andaman',
      description: 'Discover India\'s tropical paradise with turquoise waters, white sandy beaches, and stunning coral reefs. This Andaman package includes island hopping, scuba diving, sea walking, and visits to historical sites like the Cellular Jail. Perfect for beach lovers and adventure seekers.',
      price: 32999,
      duration: 6,
      max_travelers: 20,
      category: 'beach',
      rating: 4.5,
      image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
        'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800'
      ]),
      itinerary: JSON.stringify([
        { day: 1, title: 'Arrival in Port Blair', description: 'Airport pickup, Cellular Jail visit, Light and Sound show.' },
        { day: 2, title: 'Havelock Island', description: 'Ferry to Havelock, Radhanagar Beach (Asia\'s best), sunset cruise.' },
        { day: 3, title: 'Underwater World', description: 'Scuba diving at Elephant Beach, snorkeling, glass-bottom boat ride.' },
        { day: 4, title: 'Neil Island', description: 'Ferry to Neil Island, Natural Bridge, Laxmanpur Beach, coral reef viewing.' },
        { day: 5, title: 'Adventure Day', description: 'Sea walking, jet skiing, banana boat ride, bonfire night on the beach.' },
        { day: 6, title: 'Departure', description: 'Morning beach walk, Ross Island tour, airport transfer.' }
      ]),
      included: JSON.stringify(['Beach Resorts', 'All Meals', 'Ferry Tickets', 'Scuba Diving', 'Water Sports', 'Airport Transfers']),
      is_featured: 0
    },
    {
      title: 'Rajasthan Royal Heritage',
      destination: 'Rajasthan, India',
      description: 'Step into the world of maharajas and majestic forts with this Rajasthan heritage tour. Visit the pink city of Jaipur, the blue city of Jodhpur, the golden city of Jaisalmer, and the lake city of Udaipur. Experience the royal culture, desert safaris, and palatial stays.',
      price: 35999,
      duration: 8,
      max_travelers: 22,
      category: 'cultural',
      rating: 4.6,
      image_url: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800',
        'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800',
        'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800',
        'https://images.unsplash.com/photo-1548013146-72479768bada?w=800'
      ]),
      itinerary: JSON.stringify([
        { day: 1, title: 'Jaipur - Pink City', description: 'Arrive in Jaipur, Hawa Mahal, City Palace, evening bazaar walk.' },
        { day: 2, title: 'Jaipur Forts', description: 'Amber Fort elephant ride, Nahargarh Fort, Jal Mahal, Rajasthani dinner.' },
        { day: 3, title: 'Travel to Jodhpur', description: 'Drive to Jodhpur, Mehrangarh Fort, blue city walk, zip-lining over the fort.' },
        { day: 4, title: 'Jaisalmer Golden City', description: 'Travel to Jaisalmer, Golden Fort, Patwon ki Haveli, desert sunset.' },
        { day: 5, title: 'Desert Safari', description: 'Camel safari in Thar Desert, sand dunes, folk music & dance, desert camp.' },
        { day: 6, title: 'Udaipur - Lake City', description: 'Travel to Udaipur, Lake Pichola boat ride, City Palace, sunset dinner.' },
        { day: 7, title: 'Udaipur Exploration', description: 'Sajjangarh Palace, Vintage Car Museum, cooking class, farewell dinner.' },
        { day: 8, title: 'Departure', description: 'Morning walk by Fateh Sagar Lake, airport transfer.' }
      ]),
      included: JSON.stringify(['Heritage Hotels', 'All Meals', 'Desert Camp', 'Elephant Ride', 'Boat Rides', 'All Transfers']),
      is_featured: 0
    },
    {
      title: 'Maldives Overwater Villa',
      destination: 'Maldives',
      description: 'The ultimate tropical luxury escape. Stay in an overwater villa with direct ocean access, crystal-clear lagoons, and world-class snorkeling. This all-inclusive package features gourmet dining, sunset dolphin cruises, diving expeditions, and complete relaxation in paradise.',
      price: 149999,
      duration: 5,
      max_travelers: 10,
      category: 'beach',
      rating: 4.9,
      image_url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
        'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800',
        'https://images.unsplash.com/photo-1540202404-a2f29016b523?w=800',
        'https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=800'
      ]),
      itinerary: JSON.stringify([
        { day: 1, title: 'Arrival in Paradise', description: 'Seaplane transfer to resort, overwater villa check-in, champagne welcome.' },
        { day: 2, title: 'Ocean Adventures', description: 'Snorkeling at house reef, diving expedition, underwater restaurant lunch.' },
        { day: 3, title: 'Dolphin & Sunset', description: 'Dolphin watching cruise, spa treatments, private sandbank picnic.' },
        { day: 4, title: 'Island Life', description: 'Water villa relaxation, fishing trip, local island village visit, stargazing.' },
        { day: 5, title: 'Departure', description: 'Sunrise yoga, farewell breakfast, seaplane transfer.' }
      ]),
      included: JSON.stringify(['Overwater Villa', 'All-Inclusive Meals', 'Seaplane Transfers', 'Diving', 'Dolphin Cruise', 'Spa Treatment']),
      is_featured: 0
    },
    {
      title: 'Ladakh Mountain Explorer',
      destination: 'Leh-Ladakh, India',
      description: 'Conquer the rugged beauty of Ladakh on this high-altitude adventure. Ride through the world\'s highest motorable passes, camp at Pangong Lake under a canopy of stars, explore ancient monasteries, and experience the raw, untouched beauty of the Indian Himalayas.',
      price: 28999,
      duration: 7,
      max_travelers: 15,
      category: 'adventure',
      rating: 4.7,
      image_url: 'https://images.unsplash.com/photo-1626621331169-5f34be280ed9?w=800',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1626621331169-5f34be280ed9?w=800',
        'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800',
        'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800',
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800'
      ]),
      itinerary: JSON.stringify([
        { day: 1, title: 'Arrival in Leh', description: 'Fly to Leh, acclimatization day, Leh Palace visit, Shanti Stupa sunset.' },
        { day: 2, title: 'Monastery Tour', description: 'Thiksey Monastery, Hemis Monastery, Magnetic Hill, confluence of rivers.' },
        { day: 3, title: 'Khardung La Pass', description: 'Drive to world\'s highest motorable pass (5,359m), Nubra Valley, sand dunes.' },
        { day: 4, title: 'Nubra Valley', description: 'Double-humped camel ride, Diskit Monastery, hot spring at Panamik.' },
        { day: 5, title: 'Pangong Lake', description: 'Drive to Pangong Lake (14,270ft), lakeside camping, stargazing session.' },
        { day: 6, title: 'Return via Chang La', description: 'Chang La pass, Druk Padma White Lotus School, back to Leh, farewell dinner.' },
        { day: 7, title: 'Departure', description: 'Morning market visit, airport transfer.' }
      ]),
      included: JSON.stringify(['Hotels & Camps', 'All Meals', 'Oxygen Cylinder', 'Permits', 'Camel Safari', 'All Transfers']),
      is_featured: 0
    },
    {
      title: 'New York City Break',
      destination: 'New York, USA',
      description: 'Experience the city that never sleeps! From the iconic Statue of Liberty to the dazzling lights of Times Square, Broadway shows to world-class museums, this New York City package covers all the must-see attractions with skip-the-line passes and insider access.',
      price: 95999,
      duration: 5,
      max_travelers: 20,
      category: 'city',
      rating: 4.5,
      image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
        'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800',
        'https://images.unsplash.com/photo-1522083165195-3424ed129620?w=800',
        'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=800'
      ]),
      itinerary: JSON.stringify([
        { day: 1, title: 'Welcome to NYC', description: 'JFK pickup, Times Square walk, Broadway show, rooftop bar visit.' },
        { day: 2, title: 'Iconic Landmarks', description: 'Statue of Liberty, Ellis Island, Wall Street, Brooklyn Bridge sunset.' },
        { day: 3, title: 'Culture & Art', description: 'Central Park, MET Museum, 5th Avenue shopping, Top of the Rock.' },
        { day: 4, title: 'Brooklyn & Food Tour', description: 'DUMBO, Brooklyn Flea, food tour through Greenwich Village, jazz club.' },
        { day: 5, title: 'Departure', description: 'SoHo shopping, last bagel, airport transfer.' }
      ]),
      included: JSON.stringify(['4-Star Manhattan Hotel', 'Daily Breakfast', 'Broadway Tickets', 'City Pass', 'Airport Transfers', 'Food Tour']),
      is_featured: 0
    },
    {
      title: 'Himalayan Trek & Wellness',
      destination: 'Rishikesh & Manali, India',
      description: 'A perfect balance of adventure and wellness in the Himalayas. Start with yoga and meditation in Rishikesh, the yoga capital of the world, then head to Manali for trekking, river rafting, and mountain exploration. Ideal for those seeking both thrill and inner peace.',
      price: 19999,
      duration: 7,
      max_travelers: 20,
      category: 'adventure',
      rating: 4.4,
      image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800',
        'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800'
      ]),
      itinerary: JSON.stringify([
        { day: 1, title: 'Arrive in Rishikesh', description: 'Delhi to Rishikesh transfer, ashram check-in, Ganga Aarti ceremony.' },
        { day: 2, title: 'Yoga & Meditation', description: 'Morning yoga session, meditation class, Beatles Ashram visit, waterfall hike.' },
        { day: 3, title: 'River Adventure', description: 'White water rafting (16km), cliff jumping, bungee jumping (optional).' },
        { day: 4, title: 'Travel to Manali', description: 'Scenic drive to Manali, Kullu Valley views, hot springs, Old Manali walk.' },
        { day: 5, title: 'Mountain Trek', description: 'Jogini Waterfall trek, Vashisht Temple, paragliding in Solang Valley.' },
        { day: 6, title: 'Rohtang & Snow', description: 'Drive to Rohtang Pass, snow activities, Atal Tunnel visit, bonfire night.' },
        { day: 7, title: 'Departure', description: 'Morning hike, apple orchard visit, transfer to Chandigarh/Delhi.' }
      ]),
      included: JSON.stringify(['Ashram & Hotels', 'All Meals', 'Yoga Sessions', 'River Rafting', 'Trekking Guide', 'All Transfers']),
      is_featured: 0
    }
  ];

  for (const pkg of packages) {
    db.run(
      `INSERT INTO packages (title, destination, description, price, duration, max_travelers, category, rating, image_url, gallery, itinerary, included, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [pkg.title, pkg.destination, pkg.description, pkg.price, pkg.duration, pkg.max_travelers,
       pkg.category, pkg.rating, pkg.image_url, pkg.gallery, pkg.itinerary, pkg.included, pkg.is_featured]
    );
  }

  console.log(`✅ ${packages.length} travel packages created (INR pricing)\n`);

  // Sample bookings for demo user (id=2)
  const bookings = [
    { user_id: 2, package_id: 1, travelers: 2, travel_date: '2026-05-15', total_price: 91998, status: 'confirmed' },
    { user_id: 2, package_id: 5, travelers: 3, travel_date: '2026-04-10', total_price: 74997, status: 'completed' },
    { user_id: 2, package_id: 10, travelers: 1, travel_date: '2026-06-20', total_price: 28999, status: 'confirmed' },
    { user_id: 3, package_id: 4, travelers: 2, travel_date: '2026-07-01', total_price: 145998, status: 'confirmed' },
    { user_id: 3, package_id: 6, travelers: 1, travel_date: '2026-03-05', total_price: 65999, status: 'completed' },
  ];

  for (const b of bookings) {
    db.run(
      "INSERT INTO bookings (user_id, package_id, travelers, travel_date, total_price, status) VALUES (?, ?, ?, ?, ?, ?)",
      [b.user_id, b.package_id, b.travelers, b.travel_date, b.total_price, b.status]
    );
  }

  console.log(`✅ ${bookings.length} sample bookings created\n`);

  // Sample reviews
  const reviews = [
    { user_id: 2, package_id: 1, rating: 5, comment: 'Absolutely magical experience! The villa was stunning and the temple tour was unforgettable. Worth every rupee!' },
    { user_id: 3, package_id: 1, rating: 4, comment: 'Beautiful destination, great guides. The food was amazing. Would recommend to anyone.' },
    { user_id: 2, package_id: 5, rating: 5, comment: 'Kerala is truly God\'s Own Country. The houseboat experience was the highlight of my year!' },
    { user_id: 3, package_id: 4, rating: 5, comment: 'Japan blew my mind. The cultural contrast between temples and tech is incredible.' },
    { user_id: 2, package_id: 6, rating: 4, comment: 'Dubai is pure luxury. The desert safari was the best part. Amazing hospitality.' },
    { user_id: 3, package_id: 6, rating: 5, comment: 'Everything was first class. The yacht dinner cruise was absolutely stunning.' },
  ];

  for (const r of reviews) {
    db.run(
      "INSERT INTO reviews (user_id, package_id, rating, comment) VALUES (?, ?, ?, ?)",
      [r.user_id, r.package_id, r.rating, r.comment]
    );
  }

  console.log(`✅ ${reviews.length} sample reviews created\n`);

  saveDb();
  console.log('🎉 Database seeded successfully!\n');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

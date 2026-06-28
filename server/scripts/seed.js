import mongoose from 'mongoose';
import "dotenv/config";
import User from '../models/User.js';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';

const seedData = async () => {
  try {
    console.log("Connecting to Database...");
    await mongoose.connect(`${process.env.MONGODB_URI}/hotel-booking`);
    console.log("Database Connected successfully.");

    // Clear existing data
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Hotel.deleteMany({});
    await Room.deleteMany({});
    await Booking.deleteMany({});

    // 1. Create Default Owner User
    console.log("Creating default owner...");
    const defaultOwnerId = "user_2unqyL4diJFP1E3pIBnasc7w8hP"; // Matches dummy user ID from frontend assets
    const defaultOwner = await User.create({
      _id: defaultOwnerId,
      username: "Urbanza Owner",
      email: "owner.greatstack@gmail.com",
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
      role: "hotelOwner",
      isVerified: true,
      recentSearchedCities: ["New York", "London"]
    });

    // 2. Create Default Customer User
    console.log("Creating default customer...");
    const defaultCustomerId = "user_customer_test_123";
    const defaultCustomer = await User.create({
      _id: defaultCustomerId,
      username: "Jane Doe",
      email: "user.greatstack@gmail.com",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200",
      role: "user",
      isVerified: true,
      recentSearchedCities: ["New York"]
    });

    // 3. Create Hotels in different cities
    console.log("Creating hotels...");
    const hotelsData = [
      {
        _id: "67f76393197ac559e4089b72", // Matches dummy hotel ID from frontend assets
        name: "Urbanza Suites",
        address: "123 Broadway Street, Manhattan",
        contact: "+1 212-555-0199",
        owner: defaultOwnerId,
        city: "New York"
      },
      {
        _id: "67f76393197ac559e4089b73",
        name: "Burj Al Luxury",
        address: "Jumeirah Beach Road",
        contact: "+971 4 301 7777",
        owner: defaultOwnerId,
        city: "Dubai"
      },
      {
        _id: "67f76393197ac559e4089b74",
        name: "The Royal Greenwich Hotel",
        address: "King George Street, Greenwich",
        contact: "+44 20 7946 0958",
        owner: defaultOwnerId,
        city: "London"
      },
      {
        _id: "67f76393197ac559e4089b75",
        name: "Marina Bay Vista",
        address: "10 Bayfront Avenue",
        contact: "+65 6688 8868",
        owner: defaultOwnerId,
        city: "Singapore"
      }
    ];

    const hotels = await Hotel.insertMany(hotelsData);
    console.log(`Inserted ${hotels.length} hotels successfully.`);

    // 4. Create Rooms for the hotels
    console.log("Creating rooms...");
    const roomImages = {
      "Single Bed": [
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=800",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800",
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=800"
      ],
      "Double Bed": [
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800",
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=800",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800",
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=800"
      ],
      "Luxury Room": [
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=800",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800",
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=800",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800"
      ],
      "Family Suite": [
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800",
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=800",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800",
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=800"
      ]
    };

    const roomsData = [];

    // For New York (Urbanza Suites) - matches default frontend IDs to align bookings
    roomsData.push(
      {
        _id: "67f7647c197ac559e4089b96", // Matches dummy room ID from frontend assets
        hotel: "67f76393197ac559e4089b72",
        roomType: "Double Bed",
        pricePerNight: 399,
        amenities: ["Room Service", "Mountain View", "Pool Access"],
        images: roomImages["Double Bed"],
        isAvailable: true
      },
      {
        _id: "67f76452197ac559e4089b8e", // Matches dummy room ID from frontend assets
        hotel: "67f76393197ac559e4089b72",
        roomType: "Double Bed",
        pricePerNight: 299,
        amenities: ["Room Service", "Mountain View", "Pool Access"],
        images: roomImages["Double Bed"],
        isAvailable: true
      },
      {
        _id: "67f76406197ac559e4089b82", // Matches dummy room ID from frontend assets
        hotel: "67f76393197ac559e4089b72",
        roomType: "Double Bed",
        pricePerNight: 249,
        amenities: ["Free WiFi", "Free Breakfast", "Room Service"],
        images: roomImages["Double Bed"],
        isAvailable: true
      },
      {
        _id: "67f763d8197ac559e4089b7a", // Matches dummy room ID from frontend assets
        hotel: "67f76393197ac559e4089b72",
        roomType: "Single Bed",
        pricePerNight: 199,
        amenities: ["Free WiFi", "Room Service", "Pool Access"],
        images: roomImages["Single Bed"],
        isAvailable: true
      }
    );

    // Add rooms to other hotels dynamically
    const otherHotels = hotels.filter(h => h._id !== "67f76393197ac559e4089b72");
    const types = ["Single Bed", "Double Bed", "Luxury Room", "Family Suite"];
    const basePrices = { "Single Bed": 120, "Double Bed": 220, "Luxury Room": 450, "Family Suite": 650 };
    const amenitiesList = [
      ["Free WiFi", "Free Breakfast", "Room Service"],
      ["Free WiFi", "Room Service", "Pool Access"],
      ["Room Service", "Mountain View", "Pool Access"],
      ["Free WiFi", "Free Breakfast", "Room Service", "Mountain View", "Pool Access"]
    ];

    otherHotels.forEach(hotel => {
      types.forEach((type, index) => {
        roomsData.push({
          hotel: hotel._id,
          roomType: type,
          pricePerNight: basePrices[type] + Math.floor(Math.random() * 50),
          amenities: amenitiesList[index],
          images: roomImages[type],
          isAvailable: true
        });
      });
    });

    const rooms = await Room.insertMany(roomsData);
    console.log(`Inserted ${rooms.length} rooms successfully.`);

    // 5. Seed some initial bookings
    console.log("Creating bookings...");
    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + 2); // 2 days from now
    const checkOutDate = new Date();
    checkOutDate.setDate(checkOutDate.getDate() + 5); // 5 days from now

    await Booking.create({
      _id: "67f76839994a731e97d3b8ce", // Matches dummy booking ID
      user: defaultCustomerId,
      room: "67f76452197ac559e4089b8e",
      hotel: "67f76393197ac559e4089b72",
      checkInDate,
      checkOutDate,
      totalPrice: 897, // 3 nights * 299
      guests: 2,
      status: "confirmed",
      paymentMethod: "Stripe",
      isPaid: true
    });

    console.log("Bookings created successfully.");
    console.log("Database Seeding Completed Successfully!");
    
    await mongoose.disconnect();
    console.log("Disconnected from database.");
  } catch (error) {
    console.error("Database Seeding Failed:", error);
    process.exit(1);
  }
};

seedData();

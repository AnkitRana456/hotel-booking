# 🏨 Hotel Booking Platform

A full-stack Hotel Booking Platform built using the MERN Stack that enables users to search hotels, book rooms, manage reservations, and allows hotel owners/admins to manage hotels and rooms. The application includes secure authentication, image uploads, booking management, and a scalable REST API.

---

## 🚀 Features

### 👤 User Features
- User Authentication with Clerk
- Browse available hotels
- View hotel details and room information
- Search hotels by location
- Book available rooms
- View booking history
- Submit hotel reviews
- Receive booking notifications

### 🏨 Hotel Owner Features
- Hotel registration
- Add new hotels
- Manage hotel information
- Add/Edit/Delete rooms
- View all bookings
- Manage room availability
- Dashboard for hotel management

### 🔐 Security Features
- Clerk Authentication
- Protected API routes
- Role-based authorization
- Input validation using Express Validator
- Helmet security middleware
- Rate Limiting
- MongoDB Sanitization
- HTTP Parameter Pollution Protection (HPP)
- Compression Middleware

### ☁️ Cloud Features
- Cloudinary Image Upload
- MongoDB Atlas Support
- Cron Jobs
- Logging with Winston

---

# 🛠 Tech Stack

## Frontend
- React.js
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- Clerk Authentication

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

## Cloud Services
- MongoDB Atlas
- Cloudinary
- Clerk

## Security
- JWT
- Helmet
- Express Rate Limit
- Express Validator
- HPP
- Mongo Sanitize
- Cookie Parser

---

# 📂 Project Structure

```
hotel-booking/
│
├── client/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── configs/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/AnkitRana456/hotel-booking.git

cd hotel-booking
```

---

## Backend Setup

```bash
cd server

npm install
```

Create a `.env` file

```env
MONGODB_URI=YOUR_MONGODB_URI

CLERK_SECRET_KEY=YOUR_CLERK_SECRET

CLERK_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET

CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME

CLOUDINARY_API_KEY=YOUR_API_KEY

CLOUDINARY_API_SECRET=YOUR_API_SECRET
```

Run Backend

```bash
npm start
```

---

## Frontend Setup

```bash
cd client

npm install
```

Create a `.env` file

```env
VITE_BACKEND_URL=http://localhost:3000

VITE_CLERK_PUBLISHABLE_KEY=YOUR_CLERK_PUBLISHABLE_KEY
```

Run Frontend

```bash
npm run dev
```

---

# 🌐 API Overview

## Authentication
- User Login
- User Signup
- Logout

## Hotels
- Get All Hotels
- Get Hotel Details
- Register Hotel
- Update Hotel
- Delete Hotel

## Rooms
- Add Room
- Update Room
- Delete Room
- Get Available Rooms

## Booking
- Book Room
- Cancel Booking
- Get User Bookings
- Get Hotel Bookings

## Reviews
- Add Review
- Get Reviews

---

# 🔒 Security Implementations

- Authentication using Clerk
- Secure Environment Variables
- Password Encryption
- RESTful API Design
- Input Validation
- Rate Limiting
- MongoDB Sanitization
- HTTP Parameter Pollution Protection
- Secure Headers using Helmet
- Logging using Winston

---

# 📷 Screenshots

_Add screenshots of your application here._

```
Home Page

Hotel Details

Booking Page

Owner Dashboard

User Profile
```

---

# 🚀 Deployment

### Frontend

- Vercel

### Backend

- Render

### Database

- MongoDB Atlas

---

# 🧪 Future Enhancements

- Online Payment Gateway Integration
- Email Notifications
- Wishlist Feature
- Hotel Recommendation System
- Advanced Search Filters
- Google Maps Integration
- Admin Analytics Dashboard
- Multi-language Support
- Dark Mode
- Real-time Notifications

---

# 🤝 Contributing

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit changes

```bash
git commit -m "Added new feature"
```

4. Push changes

```bash
git push origin feature-name
```

5. Create a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Ankit Rana**

- GitHub: https://github.com/AnkitRana456
- LinkedIn: *(Add your LinkedIn Profile)*

---

⭐ If you found this project useful, don't forget to give it a **Star** on GitHub!

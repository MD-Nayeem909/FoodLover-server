# 🍽️ Local Food Lovers Network

A full-stack **MERN** application that connects food enthusiasts with
local restaurants, street foods, and home-cooked meal reviews.\
Users can upload photos, share their food experiences, and discover what
others are enjoying nearby.\
A community-driven platform celebrating **local flavor**, **authentic
opinions**, and **great food**.

------------------------------------------------------------------------

## ⭐ Project Overview

The **Local Food Lovers Network** allows users to:

-   Post detailed food reviews\
-   Upload food images\
-   Rate dishes and restaurants\
-   Discover food reviews from nearby locations\
-   Explore tags (Street Food, Thai, Desserts, etc.)\
-   View reviewer profile info (name, avatar, email)\
-   Join a community of real food lovers

------------------------------------------------------------------------

## 🛠️ Tech Stack

### **Backend**

-   Node.js\
-   Express.js\
-   MongoDB\
-   MongoDB Aggregation Pipeline\
-   JWT Authentication\
-   Bcrypt Password Hashing\
-   CORS Middleware\
-   Morgan Logger\


------------------------------------------------------------------------

## 📂 Project Structure (Backend)

    backend/
    │── index.js
    │── database/
    │     └── connection.js
    │── routes/
    │     ├── reviewRoutes.js
    │     ├── userRoutes.js
    │── controllers/
    │── middlewares/
    │── utils/
    └── package.json

------------------------------------------------------------------------

## 🔌 API Features

### ✔️ User System

-   Register\
-   Login\
-   JWT-based Authentication\
-   Password Hashing (bcrypt)\
-   Store avatar images

### ✔️ Review System

-   Post a new review\
-   Each review includes:
    -   foodName\
    -   image\
    -   restaurantName\
    -   location\
    -   rating\
    -   reviewText\
    -   tags\
    -   author (ObjectId → User)\
-   Aggregation `$lookup` to join User + Review\
-   Full merged review data for frontend display

------------------------------------------------------------------------

## 🔧 Installation & Setup

### 1️⃣ Clone the repository

``` bash
git clone your-repo-url
cd backend
```

### 2️⃣ Install dependencies

``` bash
npm install
```

### 3️⃣ Create environment variables (`.env`)

    MONGODB_URI=your_mongodb_uri
    JWT_SECRET=your_secret
    PORT=5000

### 4️⃣ Run the development server

``` bash
npm run start:dev
```

------------------------------------------------------------------------

## 🔍 API Endpoint Example

### **GET /reviews**

Returns all reviews joined with user data.

Example Response:

``` json
{
  "foodName": "Pad Thai",
  "restaurantName": "Bangkok Street Food",
  "location": "Dhaka",
  "rating": 5,
  "reviewText": "Perfect balance of sweet, sour, and spice!",
  "authorName": "lullu",
  "authorEmail": "lullu@gmail.com",
  "authorImage": "https://...",
  "tags": ["Thai", "Noodles", "Spicy"]
}
```

------------------------------------------------------------------------

## 🧑‍💻 Author

**Nayeem**\
Backend & Full Stack Developer

------------------------------------------------------------------------

## 📜 License

This project is open-source and free to use.

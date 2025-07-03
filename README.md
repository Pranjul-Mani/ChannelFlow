
# Channel Manager

A full-stack **Hotel Channel Manager** web application that helps admin efficiently manage room bookings, staff access, and a real-time booking calendar. Built with **Next.js 15**, **React 19**, and **MongoDB**, this system allows seamless administration with secure JWT authentication and role-based access for staff and admins.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-startedt)


## Features

-  **JWT Authentication**: Secure login/signup for admins and staff
-  **Role-Based Access**: Admin vs Staff permissions
-  **Real-Time Booking Calendar**: Visualize bookings from check-in to check-out
-  **Booking Management**: Add, view, edit, and categorize room bookings
-  **Staff Management**: Add and manage staff users
-  **MongoDB Integration**: Store and fetch live booking and user data
-  **Protected Routes**: Automatic redirection for unauthorized users using middleware



## Tech Stack

### Frontend
- **Next.js 15** – Modern React framework
- **React 19** – Declarative UI components
- **Tailwind CSS** – Utility-first styling
- **Lucide React** – Icon library

### Backend
- **Next.js API Routes** – Serverless backend functions
- **JWT (jsonwebtoken)** – Token-based authentication
- **bcryptjs** – Password hashing
- **Middleware** – Route protection and token validation

### Database
- **MongoDB** – NoSQL database

### Authentication & Security
- JWT tokens stored via `httpOnly cookies` or `localStorage`
- Middleware guards for protected routes
- Passwords hashed securely before storing in DB


## Getting Started
### 1. Clone the Repository

```bash
git clone https://github.com/your-username/channelmanager.git

cd channelmanager
```

### 2. Config Environment Variables

#### To run this project, you will need to add the following environment variables to your .env file

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

### 3. Install dependencies

```bash
  npm install
```
    
### 4. Start the server

```bash
  npm run dev
```






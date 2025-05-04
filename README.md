# MealMate API

MealMate is a RESTful API for connecting users with homemade meal/tiffin services. This backend application allows customers to browse available meals, place orders, and leave reviews, while providers can manage their meal offerings and handle orders.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Meals](#meals)
  - [Orders](#orders)
  - [Reviews](#reviews)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [File Upload](#file-upload)
- [Error Handling](#error-handling)
- [Authentication & Authorization](#authentication--authorization)

## Features

- User authentication and authorization with JWT
- Role-based access control (Customer, Provider, Admin)
- CRUD operations for users, meals, orders, and reviews
- File uploads for profile photos and review images using Multer and Cloudinary
- Comprehensive error handling
- MongoDB database integration

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload middleware
- **Cloudinary** - Cloud storage for images
- **Cors** - Cross-Origin Resource Sharing

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/logout` | Logout user | Public |
| GET | `/api/auth/me` | Get current user | Private |

### Users

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/:id` | Get user by ID | Private |
| PUT | `/api/users/:id` | Update user | Private |
| DELETE | `/api/users/:id` | Delete user | Private |
| PUT | `/api/users/:id/profile-photo` | Update profile photo | Private |

### Meals

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/meals` | Get all meals | Public |
| GET | `/api/meals/:id` | Get meal by ID | Public |
| POST | `/api/meals` | Create new meal | Provider |
| PUT | `/api/meals/:id` | Update meal | Provider |
| DELETE | `/api/meals/:id` | Delete meal | Provider |

### Orders

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/orders` | Get user orders | Private |
| GET | `/api/orders/:id` | Get order by ID | Private |
| POST | `/api/orders` | Create new order | Customer |
| PUT | `/api/orders/:id` | Update order status | Provider/Admin |
| DELETE | `/api/orders/:id` | Cancel order | Private |

### Reviews

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/meals/:mealId/reviews` | Get reviews for a meal | Public |
| GET | `/api/meals/:mealId/reviews/:id` | Get review by ID | Public |
| POST | `/api/meals/:mealId/reviews` | Add review | Customer |
| PUT | `/api/meals/:mealId/reviews/:id` | Update review | Private |
| DELETE | `/api/meals/:mealId/reviews/:id` | Delete review | Private |

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/mealmate.git
   cd mealmate/backend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables (see below)

4. Run the server
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGO_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## File Upload

MealMate uses Multer and Cloudinary for handling file uploads:

- **Profile Photos**: Users can upload profile photos (2MB max, jpg/jpeg/png)
- **Review Photos**: Customers can attach up to 5 photos to their reviews (2MB max each, jpg/jpeg/png)

Files are stored in Cloudinary with the following folder structure:
- User profile photos: `mealmate/users`
- Review photos: `mealmate/reviews`

## Error Handling

The API uses a centralized error handling middleware that returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

Common error types:
- 400: Bad Request (validation errors, duplicate entries)
- 401: Unauthorized (authentication errors)
- 403: Forbidden (authorization errors)
- 404: Not Found (resource not found)
- 500: Server Error (unexpected errors)

## Authentication & Authorization

- **JWT Authentication**: JSON Web Tokens are used for authentication
- **Cookie Storage**: Tokens are stored in HTTP-only cookies for security
- **Role-Based Access**: Three user roles with different permissions:
  - **Customer**: Can browse meals, place orders, and leave reviews
  - **Provider**: Can manage meals and handle orders
  - **Admin**: Has full access to all resources

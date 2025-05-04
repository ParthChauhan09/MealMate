# MealMate Backend API

Backend API for MealMate - an application connecting users with homemade meal/tiffin services.

## Features

- User authentication (both customers and meal providers)
- Meal/tiffin service listings
- Order management
- Reviews and ratings
- User profiles
- Search and filtering functionality

## Setup Instructions

1. Clone the repository
2. Navigate to the backend directory: `cd backend`
3. Install dependencies: `npm install`
4. Create a `.env` file based on `.env.example`
5. Start the development server: `npm run dev`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Meals
- `GET /api/meals` - Get all meals
- `GET /api/meals/:id` - Get meal by ID
- `POST /api/meals` - Create new meal (provider only)
- `PUT /api/meals/:id` - Update meal (provider only)
- `DELETE /api/meals/:id` - Delete meal (provider only)

### Orders
- `GET /api/orders` - Get all orders (for current user)
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status
- `DELETE /api/orders/:id` - Cancel order

### Reviews
- `GET /api/meals/:id/reviews` - Get reviews for a meal
- `POST /api/meals/:id/reviews` - Add review for a meal
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

# MealMate Backend API Documentation

Backend API for MealMate - connecting users with homemade meal/tiffin services.

## 🚀 Features

- User authentication and authorization (JWT)
- Role-based access control (Customer, Provider, Admin)
- Meal management (CRUD operations)
- Order management with status tracking
- Review and rating system with photo uploads
- File upload support (Cloudinary integration)
- RESTful API design
- MongoDB integration with Mongoose

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer + Cloudinary
- **Password Hashing**: bcryptjs
- **Environment Management**: dotenv
- **CORS**: cors middleware

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account for file uploads

## ⚙️ Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/mealmate.git
   cd mealmate/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:

   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Connection
   MONGO_URI=your_mongodb_connection_string

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Start the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication

Most endpoints require authentication via JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Routes (`/api/auth`)

### Register User

- **POST** `/api/auth/register`
- **Access**: Public
- **Description**: Register a new user account

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer",
  "phone": "1234567890",
  "address": "123 Main St"
}
```

**Response:**

```json
{
  "success": true,
  "token": "jwt_token_here"
}
```

### Login User

- **POST** `/api/auth/login`
- **Access**: Public
- **Description**: Login with email and password

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "token": "jwt_token_here"
}
```

### Logout User

- **GET** `/api/auth/logout`
- **Access**: Public
- **Description**: Logout user and clear cookie

**Response:**

```json
{
  "success": true,
  "data": {}
}
```

### Get Current User

- **GET** `/api/auth/me`
- **Access**: Private
- **Description**: Get current logged-in user details

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "phone": "1234567890",
    "address": "123 Main St",
    "profilePhoto": "cloudinary_url"
  }
}
```

---

## 👥 User Routes (`/api/users`)

### Get All Users

- **GET** `/api/users`
- **Access**: Admin only
- **Description**: Get list of all users

**Response:**

```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "phone": "1234567890",
      "address": "123 Main St",
      "profilePhoto": "cloudinary_url"
    }
  ]
}
```

### Get User by ID

- **GET** `/api/users/:id`
- **Access**: Private
- **Description**: Get specific user details

### Update User

- **PUT** `/api/users/:id`
- **Access**: Private (own profile or admin)
- **Description**: Update user information

**Request Body:**

```json
{
  "name": "John Updated",
  "phone": "0987654321",
  "address": "456 New St"
}
```

### Delete User

- **DELETE** `/api/users/:id`
- **Access**: Private (own profile or admin)
- **Description**: Delete user account

### Update Profile Photo

- **PUT** `/api/users/:id/profile-photo`
- **Access**: Private
- **Description**: Upload/update user profile photo
- **Content-Type**: multipart/form-data

**Form Data:**

- `profilePhoto`: Image file (jpg, jpeg, png - max 2MB)

---

## 🍽 Meal Routes (`/api/meals`)

### Get All Meals

- **GET** `/api/meals`
- **Access**: Public
- **Description**: Get list of all available meals

**Response:**

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "meal_id",
      "name": "Homemade Biryani",
      "description": "Delicious chicken biryani with aromatic spices",
      "price": 150,
      "category": "lunch",
      "availability": true,
      "user": "provider_id",
      "provider": "provider_id"
    }
  ]
}
```

### Get Meal by ID

- **GET** `/api/meals/:id`
- **Access**: Public
- **Description**: Get specific meal details

### Create Meal

- **POST** `/api/meals`
- **Access**: Provider only
- **Description**: Create a new meal listing

**Request Body:**

```json
{
  "name": "Homemade Biryani",
  "description": "Delicious chicken biryani with aromatic spices",
  "price": 150,
  "category": "lunch"
}
```

### Update Meal

- **PUT** `/api/meals/:id`
- **Access**: Provider (own meals only)
- **Description**: Update meal information

### Delete Meal

- **DELETE** `/api/meals/:id`
- **Access**: Provider (own meals only)
- **Description**: Delete meal listing

---

## 📦 Order Routes (`/api/orders`)

### Get User Orders

- **GET** `/api/orders`
- **Access**: Private
- **Description**: Get orders based on user role
  - **Customer**: Returns their orders
  - **Provider**: Returns orders for their meals
  - **Admin**: Returns all orders

**Response:**

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "order_id",
      "meal": {
        "_id": "meal_id",
        "name": "Homemade Biryani",
        "price": 150,
        "description": "Delicious chicken biryani"
      },
      "user": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "provider": {
        "_id": "provider_id",
        "name": "Jane Chef"
      },
      "status": "pending",
      "quantity": 2,
      "deliveryAddress": "123 Main St",
      "deliveryDate": "2024-01-15T12:00:00.000Z",
      "specialInstructions": "Extra spicy please",
      "createdAt": "2024-01-14T10:00:00.000Z"
    }
  ]
}
```

### Get Order by ID

- **GET** `/api/orders/:id`
- **Access**: Private (order owner, provider, or admin)
- **Description**: Get specific order details

### Create Order

- **POST** `/api/orders`
- **Access**: Customer only
- **Description**: Create a new order

**Request Body:**

```json
{
  "meal": "meal_id",
  "quantity": 2,
  "deliveryAddress": "123 Main St",
  "deliveryDate": "2024-01-15T12:00:00.000Z",
  "specialInstructions": "Extra spicy please"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "order_id",
    "meal": "meal_id",
    "user": "user_id",
    "provider": "provider_id",
    "status": "pending",
    "quantity": 2,
    "deliveryAddress": "123 Main St",
    "deliveryDate": "2024-01-15T12:00:00.000Z",
    "specialInstructions": "Extra spicy please",
    "createdAt": "2024-01-14T10:00:00.000Z"
  }
}
```

### Update Order Status

- **PUT** `/api/orders/:id`
- **Access**: Provider (for their orders) or Admin
- **Description**: Update order status

**Request Body:**

```json
{
  "status": "confirmed"
}
```

**Valid Status Values:**

- `pending` - Initial status when order is created
- `confirmed` - Provider has confirmed the order
- `preparing` - Provider is preparing the meal
- `ready` - Meal is ready for pickup/delivery
- `delivered` - Order has been delivered
- `cancelled` - Order has been cancelled

### Cancel Order

- **DELETE** `/api/orders/:id`
- **Access**: Customer (own orders), Provider (their orders), or Admin
- **Description**: Cancel an order (only if status is pending or confirmed)

---

## ⭐ Review Routes (`/api/reviews`)

### Get Reviews for a Meal

- **GET** `/api/meals/:mealId/reviews`
- **Access**: Public
- **Description**: Get all reviews for a specific meal

**Response:**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "review_id",
      "rating": 5,
      "text": "Amazing food! Highly recommended.",
      "user": {
        "_id": "user_id",
        "name": "John Doe"
      },
      "meal": "meal_id",
      "photos": ["cloudinary_url_1", "cloudinary_url_2"],
      "createdAt": "2024-01-14T10:00:00.000Z"
    }
  ]
}
```

### Get Review by ID

- **GET** `/api/reviews/:id`
- **Access**: Public
- **Description**: Get specific review details

### Add Review

- **POST** `/api/meals/:mealId/reviews`
- **Access**: Customer only
- **Description**: Add a review for a meal (one review per user per meal)
- **Content-Type**: multipart/form-data

**Form Data:**

- `rating`: Number (1-5)
- `text`: String (review text)
- `reviewPhotos`: Image files (optional, up to 5 photos, jpg/jpeg/png - max 2MB each)

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "review_id",
    "rating": 5,
    "text": "Amazing food! Highly recommended.",
    "user": "user_id",
    "meal": "meal_id",
    "photos": ["cloudinary_url_1", "cloudinary_url_2"],
    "createdAt": "2024-01-14T10:00:00.000Z"
  }
}
```

### Update Review

- **PUT** `/api/reviews/:id`
- **Access**: Review owner or Admin
- **Description**: Update a review
- **Content-Type**: multipart/form-data

### Delete Review

- **DELETE** `/api/reviews/:id`
- **Access**: Review owner or Admin
- **Description**: Delete a review

---

## 📊 Data Models

### User Model

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, min: 6),
  role: String (enum: ["customer", "provider", "admin"], default: "customer"),
  phone: String (optional, 10 digits),
  address: String (optional),
  profilePhoto: String (default: placeholder image)
}
```

### Meal Model

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: "User", required),
  name: String (required),
  description: String (required),
  price: Number (required, min: 0),
  category: String (enum: ["breakfast", "lunch", "dinner", "snack", "beverage"], required),
  availability: Boolean (default: true),
  provider: ObjectId (ref: "User", required)
}
```

### Order Model

```javascript
{
  _id: ObjectId,
  meal: ObjectId (ref: "Meal", required),
  user: ObjectId (ref: "User", required),
  provider: ObjectId (ref: "User", required),
  status: String (enum: ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"], default: "pending"),
  quantity: Number (required, min: 1),
  deliveryAddress: String (required),
  deliveryDate: Date (required),
  specialInstructions: String (optional),
  createdAt: Date (default: Date.now)
}
```

### Review Model

```javascript
{
  _id: ObjectId,
  rating: Number (required, min: 1, max: 5),
  text: String (required),
  user: ObjectId (ref: "User", required),
  meal: ObjectId (ref: "Meal", required),
  photos: [String] (array of Cloudinary URLs, default: []),
  createdAt: Date (default: Date.now)
}
```

---

## 🔒 Authentication & Authorization

### User Roles

- **Customer**: Can browse meals, place orders, write reviews
- **Provider**: Can create/manage meals, view/update orders for their meals
- **Admin**: Full access to all resources

### JWT Token

- Tokens expire in 30 days by default
- Include in Authorization header: `Bearer <token>`
- Also stored as httpOnly cookie for web clients

### Protected Routes

Most routes require authentication. Role-based access is enforced where specified.

---

## 📁 File Upload

### Supported File Types

- **Images**: jpg, jpeg, png
- **Max Size**: 2MB per file

### Upload Endpoints

- **Profile Photos**: `/api/users/:id/profile-photo`
- **Review Photos**: `/api/meals/:mealId/reviews` (up to 5 photos)

### Cloudinary Integration

- Images are automatically optimized and resized
- Profile photos: 500x500px max
- Review photos: 800x800px max
- Organized in folders: `mealmate/profiles/` and `mealmate/reviews/`

---

## 🚀 Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests with Jest
```

---

## 🔧 Error Handling

All API responses follow a consistent format:

**Success Response:**

```json
{
  "success": true,
  "data": { ... },
  "count": 10  // For list endpoints
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Tests cover:

- Authentication endpoints
- CRUD operations for all models
- File upload functionality
- Authorization and role-based access

---

## 📝 Notes for Frontend Development

### Base API URL

```javascript
const API_BASE_URL = "http://localhost:5000/api";
```

### Authentication Headers

```javascript
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};
```

### File Upload Headers

```javascript
const headers = {
  Authorization: `Bearer ${token}`,
  // Don't set Content-Type for FormData - browser will set it automatically
};
```

### Order Status Flow

```
pending → confirmed → preparing → ready → delivered
    ↓
cancelled (only from pending/confirmed)
```

### Role-Based UI Considerations

- **Customer**: Show meal browsing, order history, review forms
- **Provider**: Show meal management, order management dashboard
- **Admin**: Show user management, all orders, system overview

### API Response Patterns

All successful responses include:

- `success: true`
- `data: {}` (single item) or `data: []` (array)
- `count: number` (for list endpoints)

### Frontend Integration Tips

1. **Authentication**: Store JWT token in localStorage or secure cookie
2. **File Uploads**: Use FormData for multipart requests
3. **Error Handling**: Check `success` field in responses
4. **Loading States**: Handle async operations appropriately
5. **Role Checks**: Implement role-based component rendering

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

---

## 📄 License

This project is licensed under the ISC License.

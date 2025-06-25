const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const multer = require('multer');
const upload = multer();

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Middleware
app.use(cors());

// Set static folder for serving files locally (if needed)
app.use(express.static("public"));

// Define routes
app.use("/api/auth", express.json(), require("./routes/authRoutes"));
app.use("/api/users", express.json(), require("./routes/userRoutes"));
app.use("/api/meals", require("./routes/mealRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));

// Direct test route for file upload debugging
app.post('/test-direct', upload.single('testFile'), (req, res) => {
  res.json({ file: req.file, body: req.body });
});

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to MealMate API",
    version: "1.0.0",
  });
});

// Error handling middleware
app.use(errorHandler);

// Set port
const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

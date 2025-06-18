// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

const sequelize = require('./config/database');

dotenv.config();  // Load environment variables

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use('/uploads', express.static('uploads')); // Serve static files (images, etc.)

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);

// Database connection and server start
sequelize.sync().then(() => {
  console.log('Database connected successfully!');
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
  });
}).catch((err) => {
  console.error('Error connecting to the database', err);
});

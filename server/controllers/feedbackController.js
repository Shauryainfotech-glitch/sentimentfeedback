// controllers/feedbackController.js
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');
const dotenv = require('dotenv');
dotenv.config();  // Load environment variables from .env

const Feedback = require('../models/Feedback');

// AWS S3 Configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

// Set up multer storage with S3
const storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_BUCKET_NAME,
  acl: 'public-read',
  key: (req, file, cb) => {
    cb(null, `feedbacks/${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });  // Multer upload middleware

// Submit Feedback function
const submitFeedback = async (req, res) => {
  try {
    const { name, phone, description, overallRating, departmentRatings } = req.body;

    if (!overallRating) return res.status(400).json({ error: 'Overall rating is required.' });

    const imageUrl = req.file ? req.file.location : '';  // Get the image URL from S3

    const feedback = await Feedback.create({
      name,
      phone,
      description,
      overallRating,
      departmentRatings: JSON.parse(departmentRatings || '[]'),
      imageUrl,
    });

    res.status(201).json({ message: 'Feedback submitted successfully.', feedback });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Export 'upload' middleware and 'submitFeedback' function
module.exports = { upload, submitFeedback };

// Get all feedback
exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get feedback by ID
exports.getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findByPk(req.params.id);
    if (!feedback) return res.status(404).json({ error: 'Feedback not found' });
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete all feedback
exports.deleteAllFeedback = async (req, res) => {
  try {
    await Feedback.destroy({ where: {} });
    res.status(200).json({ message: 'All feedback deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete feedback by ID
exports.deleteFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findByPk(req.params.id);
    if (!feedback) return res.status(404).json({ error: 'Feedback not found' });
    await feedback.destroy();
    res.status(200).json({ message: 'Feedback deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

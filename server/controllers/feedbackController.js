// controllers/feedbackController.js
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');
const multer = require('multer');
const dotenv = require('dotenv');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();
dotenv.config(); // Load environment variables from .env

const Feedback = require('../models/Feedback');

// AWS S3 Configuration with SDK v3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

// Set up multer storage with S3
const storage = multerS3({
  s3: s3Client,
  bucket: process.env.AWS_BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    const fileName = `feedbacks/${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Submit Feedback function
const submitFeedback = async (req, res) => {
  try {
    const { name, phone, description, overallRating, departmentRatings } = req.body;

    if (!overallRating) return res.status(400).json({ error: 'Overall rating is required.' });

    const imageUrl = req.file ? req.file.location : ''; // Get the image URL from S3

    const feedback = await Feedback.create({
      name,
      phone,
      description,
      overallRating,
      departmentRatings: JSON.parse(departmentRatings || '[]'),
      imageUrl,
    });

    res.status(201).json({ message: 'Feedback submitted successfully.' });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

// Get all feedback
const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get feedback by ID
const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findByPk(req.params.id);
    if (!feedback) return res.status(404).json({ error: 'Feedback not found' });
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete all feedback
const deleteAllFeedback = async (req, res) => {
  try {
    await Feedback.destroy({ where: {} });
    res.status(200).json({ message: 'All feedback deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete feedback by ID
const deleteFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findByPk(req.params.id);
    if (!feedback) return res.status(404).json({ error: 'Feedback not found' });
    await feedback.destroy();
    res.status(200).json({ message: 'Feedback deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Export all controller functions
module.exports = {
  upload,
  submitFeedback,
  getAllFeedback,
  getFeedbackById,
  deleteAllFeedback,
  deleteFeedbackById
};

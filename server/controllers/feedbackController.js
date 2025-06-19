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
    fileSize: 5 * 1024 * 1024, // 5MB limit
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

    res.status(201).json({ message: 'Feedback submitted successfully.', feedback });
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

// API to get overall rating analysis
const getOverallRatingAnalysis = async (req, res) => {
  try {
    console.log('--- getOverallRatingAnalysis called ---');
    const feedbacks = await Feedback.findAll();
    console.log('Feedbacks:', feedbacks);
    // Count feedbacks for each overallRating (1-5)
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbacks.forEach(fb => {
      const rating = Number(fb.overallRating);
      if (ratingCounts[rating] !== undefined) {
        ratingCounts[rating]++;
      }
    });
    res.json(ratingCounts);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// API to get department-wise rating analysis (average rating per department)
const getDepartmentRatingAnalysis = async (req, res) => {
  try {
    console.log('--- getDepartmentRatingAnalysis called ---');
    const feedbacks = await Feedback.findAll();
    console.log('Feedbacks:', feedbacks);
    const departmentStats = {};
    feedbacks.forEach(fb => {
      let deptRatings = fb.departmentRatings;
      console.log('Raw departmentRatings:', deptRatings);
      if (!deptRatings) return;
      if (typeof deptRatings === 'string') {
        try { deptRatings = JSON.parse(deptRatings); } catch (e) { 
          console.error('JSON parse error:', e, 'Value:', deptRatings);
          return; 
        }
      }
      if (!Array.isArray(deptRatings)) {
        console.error('Not an array:', deptRatings);
        return;
      }
      deptRatings.forEach(dept => {
        if (!dept || !dept.department || isNaN(Number(dept.rating))) {
          console.error('Invalid dept entry:', dept);
          return;
        }
        if (!departmentStats[dept.department]) {
          departmentStats[dept.department] = { total: 0, count: 0 };
        }
        departmentStats[dept.department].total += Number(dept.rating);
        departmentStats[dept.department].count++;
      });
    });
    // Calculate average for each department
    const result = {};
    for (const dept in departmentStats) {
      result[dept] = (departmentStats[dept].total / departmentStats[dept].count).toFixed(2);
    }
    res.json(result);
  } catch (error) {
    console.error('Department rating analysis error:', error, error.stack);
    res.status(500).json({ error: 'Server  awsjj error: ' + error.message });
  }
};

// Export all controller functions
module.exports = {
  upload,
  submitFeedback,
  getAllFeedback,
  getFeedbackById,
  deleteAllFeedback,
  deleteFeedbackById,
  getOverallRatingAnalysis,
  getDepartmentRatingAnalysis
};

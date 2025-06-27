// controllers/feedbackController.js
const dotenv = require('dotenv');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();
dotenv.config(); // Load environment variables from .env

const Feedback = require('../models/Feedback');

// Submit Feedback function
const submitFeedback = async (req, res) => {
  try {
    const { name, phone, description, overallRating, departmentRatings, policeStation } = req.body;

    if (!overallRating) return res.status(400).json({ error: 'Overall rating is required.' });
    if (!policeStation) return res.status(400).json({ error: 'Police station is required.' });

    let parsedDepartmentRatings = [];
    if (typeof departmentRatings === 'string') {
      parsedDepartmentRatings = JSON.parse(departmentRatings || '[]');
    } else if (Array.isArray(departmentRatings)) {
      parsedDepartmentRatings = departmentRatings;
    }

    const feedback = await Feedback.create({
      name,
      phone,
      description,
      overallRating,
      departmentRatings: parsedDepartmentRatings,
      policeStation,
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


// Update Feedback function
const updateFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByPk(req.params.id);
    if (!feedback) return res.status(404).json({ error: 'Feedback not found' });

    const { name, phone, description, overallRating, departmentRatings, policeStation } = req.body;

    // Recalculate sentiment description if the description is updated
    let sentimentDescription = feedback.sentiment; // Keep previous sentiment if description is not updated
    if (description) {
      const sentimentResult = sentiment.analyze(description);
      if (sentimentResult.score > 0) {
        sentimentDescription = 'positive';
      } else if (sentimentResult.score < 0) {
        sentimentDescription = 'negative';
      } else {
        sentimentDescription = 'neutral';
      }
    }

    // Update feedback with new details
    feedback.name = name || feedback.name;
    feedback.phone = phone || feedback.phone;
    feedback.description = description || feedback.description;
    feedback.overallRating = overallRating || feedback.overallRating;
    feedback.departmentRatings = departmentRatings || feedback.departmentRatings;
    feedback.policeStation = policeStation || feedback.policeStation;
    feedback.sentiment = sentimentDescription;  // Update sentiment description

    await feedback.save(); // Save updated feedback

    res.status(200).json({ message: 'Feedback updated successfully.' });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};


// Export all controller functions
module.exports = {
  submitFeedback,
  getAllFeedback,
  getFeedbackById,
  deleteAllFeedback,
  deleteFeedbackById,
  updateFeedback
};

const Feedback = require('../models/Feedback');

exports.submitFeedback = async (req, res) => {
  try {
    const { name, phone, description, overallRating, departmentRatings } = req.body;
    if (!overallRating) return res.status(400).json({ error: 'Overall rating is required.' });

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const feedback = new Feedback({
      name,
      phone,
      description,
      overallRating,
      departmentRatings: JSON.parse(departmentRatings || '[]'),
      imageUrl,
    });

    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully.' });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ error: 'Feedback not found' });
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteAllFeedback = async (req, res) => {
  try {
    await Feedback.deleteMany();
    res.status(200).json({ message: 'All feedback deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteFeedbackById = async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Feedback deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const mongoose = require('mongoose');

const departmentRatingSchema = new mongoose.Schema({
  department: String,
  rating: Number,
});

const feedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  description: { type: String, required: true, maxlength: 300 },
  imageUrl: { type: String },
  overallRating: { type: Number, required: true },
  departmentRatings: [departmentRatingSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Feedback', feedbackSchema);

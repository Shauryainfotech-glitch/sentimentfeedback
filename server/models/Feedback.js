// models/Feedback.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Feedback = sequelize.define('Feedback', {
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false, maxlength: 300 },
  imageUrl: { type: DataTypes.STRING },
  overallRating: { type: DataTypes.INTEGER, allowNull: false },
  departmentRatings: { type: DataTypes.JSONB },
}, {});

module.exports = Feedback;

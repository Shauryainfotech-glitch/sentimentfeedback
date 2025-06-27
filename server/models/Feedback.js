const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Feedback = sequelize.define('Feedback', {
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  policeStation: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false, maxlength: 300 },
  overallRating: { type: DataTypes.INTEGER, allowNull: false },
  departmentRatings: { type: DataTypes.JSONB },
  sentiment: { type: DataTypes.STRING },  // Change to STRING to store text descriptions
  correctiveMeasure: { type: DataTypes.STRING },  // New field for corrective measure
  testing: { type: DataTypes.STRING },  // New field for testing
}, {});

module.exports = Feedback;

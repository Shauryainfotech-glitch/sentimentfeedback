const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// User model without firstLogin field
const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
}, {});

module.exports = User;

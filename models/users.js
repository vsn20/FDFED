const mongoose = require('mongoose');

// Define the Users schema
const userSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: [true, 'User ID is required'],
    unique: true, // Ensures no duplicate user_ids
    trim: true
  },
  emp_id: {
    type: String,
    trim: true // Made optional for companies
  },
  c_id: {
    type: String,
    trim: true // Made optional for employees and customers
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Create and export the model
const User = mongoose.model('User', userSchema);

module.exports = User;
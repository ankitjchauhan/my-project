const mongoose = require('mongoose');

/**
 * User schema representing a simple bank account.
 * Each user has a name and a numeric balance.
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  balance: {
    type: Number,
    required: true,
    min: [0, 'Balance cannot be negative'],
  },
});

// Export the Mongoose model
module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  username: { 
    type: String, 
    unique: true, 
    required: true,
    trim: true
  },
  passwordHash: { 
    type: String, 
    required: true 
  },
  encryptedEmail: { 
    type: String, 
    default: ''
  },

  // 🔥 ROLE FIELD
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('User', userSchema);

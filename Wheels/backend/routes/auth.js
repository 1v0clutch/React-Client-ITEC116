const express = require('express');
const router = express.Router(); // ADD THIS LINE - YOU'RE MISSING IT
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { encrypt, decrypt } = require('../utils/crypto');

const JWT_SECRET = process.env.JWT_SECRET;

// Register
router.post('/register', async (req, res) => {
  try {
    const { fullName, username, password, email, confirmPassword } = req.body;
    
    // Enhanced validation
    if (!fullName || !username || !password || !email || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists (both username and email)
    const existingUser = await User.findOne({ 
      $or: [{ username }, { encryptedEmail: encrypt(email) }] 
    });
    
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ error: 'Username already exists' });
      } else {
        return res.status(400).json({ error: 'Email already registered' });
      }
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const encryptedEmail = encrypt(email);

    const user = new User({ 
      fullName, 
      username, 
      passwordHash, 
      encryptedEmail 
    });
    
    await user.save();

    return res.status(201).json({ 
      message: 'User registered successfully',
      userId: user._id 
    });
  } catch (err) {
    console.error('Registration error:', err);
    
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    return res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ 
      id: user._id, 
      username: user.username 
    }, JWT_SECRET, { expiresIn: '6h' });

    const decryptedEmail = user.encryptedEmail ? decrypt(user.encryptedEmail) : '';

    return res.json({
      message: 'Login successful',
      token,
      user: { 
        id: user._id, 
        fullName: user.fullName,
        username: user.username, 
        email: decryptedEmail 
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;
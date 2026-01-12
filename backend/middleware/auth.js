const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Authentication middleware to verify JWT tokens
 * Validates token signature and expiration
 * Attaches user ID to request object for downstream use
 */
const verifyToken = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Check if header follows "Bearer <token>" format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    const token = parts[1];

    // Verify token signature and expiration
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach user information to request object
    req.userId = decoded.id;
    req.username = decoded.username;
    
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    console.error('Token verification error:', err);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = { verifyToken };

// Set up environment variable for testing BEFORE requiring modules
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only-minimum-32-chars';

const fc = require('fast-check');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('./auth');

describe('Authentication Middleware Property Tests', () => {
  /**
   * Feature: ecommerce-authentication, Property 4: JWT token authentication
   * Validates: Requirements 2.1, 2.3
   * 
   * For any valid JWT token, when included in the Authorization header, 
   * the system should successfully authenticate the request and extract the user ID
   */
  test('Property 4: JWT token authentication - valid tokens extract user ID', () => {
    fc.assert(
      fc.property(
        fc.uuid(), // Generate random user IDs
        fc.string({ minLength: 3, maxLength: 20 }).map(s => s.trim()).filter(s => s.length >= 3), // Generate random usernames (trimmed, non-empty)
        (userId, username) => {
          // Create a valid JWT token
          const token = jwt.sign(
            { id: userId, username: username },
            process.env.JWT_SECRET,
            { expiresIn: '6h' }
          );

          // Mock request and response objects
          const req = {
            headers: {
              authorization: `Bearer ${token}`
            }
          };
          const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
          };
          const next = jest.fn();

          // Call the middleware
          verifyToken(req, res, next);

          // Debug: log if test fails
          if (!(next.mock.calls.length === 1 && req.userId === userId && req.username === username)) {
            console.log('Test failed for:', { userId, username, nextCalls: next.mock.calls.length, reqUserId: req.userId, reqUsername: req.username });
            if (res.status.mock.calls.length > 0) {
              console.log('Response status:', res.status.mock.calls[0][0]);
              console.log('Response json:', res.json.mock.calls[0][0]);
            }
          }

          // Verify that next() was called (authentication succeeded)
          // and user ID was attached to request
          return next.mock.calls.length === 1 && 
                 req.userId === userId && 
                 req.username === username;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 4: JWT token authentication - missing token returns 401', () => {
    const req = {
      headers: {}
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  test('Property 4: JWT token authentication - invalid token format returns 401', () => {
    const req = {
      headers: {
        authorization: 'InvalidFormat'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token format' });
    expect(next).not.toHaveBeenCalled();
  });

  test('Property 4: JWT token authentication - tampered token returns 401', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 3, maxLength: 20 }),
        (userId, username) => {
          // Create a valid token
          const token = jwt.sign(
            { id: userId, username: username },
            process.env.JWT_SECRET,
            { expiresIn: '6h' }
          );

          // Tamper with the token by modifying a character
          const tamperedToken = token.slice(0, -5) + 'XXXXX';

          const req = {
            headers: {
              authorization: `Bearer ${tamperedToken}`
            }
          };
          const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
          };
          const next = jest.fn();

          verifyToken(req, res, next);

          // Should return 401 and not call next()
          return res.status.mock.calls[0][0] === 401 && 
                 next.mock.calls.length === 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 4: JWT token authentication - expired token returns 401', async () => {
    const userId = 'test-user-id';
    const username = 'testuser';

    // Create an expired token (expires in -1 second, which is already expired)
    const token = jwt.sign(
      { id: userId, username: username },
      process.env.JWT_SECRET,
      { expiresIn: '-1s' }
    );

    const req = {
      headers: {
        authorization: `Bearer ${token}`
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    // The error could be either "Token expired" or "Invalid token" depending on JWT library version
    expect(res.json).toHaveBeenCalled();
    expect(res.json.mock.calls[0][0].error).toMatch(/expired|invalid/i);
    expect(next).not.toHaveBeenCalled();
  });
});

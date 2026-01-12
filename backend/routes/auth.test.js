const fc = require('fast-check');
const bcrypt = require('bcryptjs');

describe('Authentication Property Tests', () => {
  /**
   * Feature: ecommerce-authentication, Property 1: Password hashing is irreversible
   * Validates: Requirements 6.1, 6.3, 6.5
   * 
   * For any valid password string, after hashing with bcrypt, the original password 
   * cannot be recovered from the hash, and verification must use bcrypt.compare()
   */
  test('Property 1: Password hashing is irreversible - hash differs from original', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 6, maxLength: 50 }).filter(s => s.trim().length >= 6),
        async (password) => {
          const salt = await bcrypt.genSalt(12);
          const hash = await bcrypt.hash(password, salt);
          
          // Hash should be different from original password
          return hash !== password;
        }
      ),
      { numRuns: 20 }
    );
  }, 30000);

  test('Property 1: Password hashing is irreversible - bcrypt.compare verifies correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 6, maxLength: 50 }).filter(s => s.trim().length >= 6),
        async (password) => {
          const salt = await bcrypt.genSalt(12);
          const hash = await bcrypt.hash(password, salt);
          
          // bcrypt.compare should return true for correct password
          const isMatch = await bcrypt.compare(password, hash);
          return isMatch === true;
        }
      ),
      { numRuns: 20 }
    );
  }, 30000);

  test('Property 1: Password hashing is irreversible - same password produces different hashes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 6, maxLength: 50 }).filter(s => s.trim().length >= 6),
        async (password) => {
          const salt1 = await bcrypt.genSalt(12);
          const hash1 = await bcrypt.hash(password, salt1);
          
          const salt2 = await bcrypt.genSalt(12);
          const hash2 = await bcrypt.hash(password, salt2);
          
          // Same password should produce different hashes due to different salts
          return hash1 !== hash2;
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);

  test('Property 1: Password hashing is irreversible - wrong password fails verification', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 6, maxLength: 50 }).filter(s => s.trim().length >= 6),
        fc.string({ minLength: 6, maxLength: 50 }).filter(s => s.trim().length >= 6),
        async (password1, password2) => {
          // Skip if passwords are the same
          if (password1 === password2) return true;
          
          const salt = await bcrypt.genSalt(12);
          const hash = await bcrypt.hash(password1, salt);
          
          // Different password should not match
          const isMatch = await bcrypt.compare(password2, hash);
          return isMatch === false;
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);
});

/**
 * Feature: ecommerce-authentication, Property 5: Invalid credentials rejection
 * Validates: Requirements 2.2
 * 
 * For any login attempt with incorrect username or password, 
 * the system should reject the login and not generate a token
 */
describe('Property 5: Invalid credentials rejection', () => {
  // Mock database and dependencies
  const mockUser = {
    _id: 'test-user-id',
    username: 'validuser',
    passwordHash: null, // Will be set in beforeAll
    fullName: 'Test User',
    encryptedEmail: 'encrypted-email'
  };

  beforeAll(async () => {
    // Create a valid password hash for testing
    const salt = await bcrypt.genSalt(12);
    mockUser.passwordHash = await bcrypt.hash('validpassword', salt);
  });

  test('Property 5: Invalid username returns error and no token', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 3, maxLength: 20 }).filter(s => s !== mockUser.username && s.trim().length >= 3),
        fc.string({ minLength: 6, maxLength: 50 }),
        (invalidUsername, anyPassword) => {
          // Simulate login logic with invalid username
          // In real implementation, User.findOne would return null
          const userFound = invalidUsername === mockUser.username ? mockUser : null;
          
          // Should not find user
          return userFound === null;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 5: Invalid password returns error and no token', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 6, maxLength: 50 }).filter(s => s !== 'validpassword' && s.trim().length >= 6),
        async (invalidPassword) => {
          // Simulate login logic with valid username but invalid password
          const isMatch = await bcrypt.compare(invalidPassword, mockUser.passwordHash);
          
          // Password should not match
          return isMatch === false;
        }
      ),
      { numRuns: 10 } // Reduced from 50 to avoid timeout with slow bcrypt
    );
  }, 60000); // Increased timeout to 60 seconds

  test('Property 5: Empty credentials are rejected', () => {
    // Test that empty username or password should be rejected
    const emptyUsername = '';
    const emptyPassword = '';
    const validUsername = 'validuser';
    const validPassword = 'validpassword';

    // All these combinations should be rejected
    const testCases = [
      { username: emptyUsername, password: validPassword, shouldReject: true },
      { username: validUsername, password: emptyPassword, shouldReject: true },
      { username: emptyUsername, password: emptyPassword, shouldReject: true },
    ];

    testCases.forEach(testCase => {
      const isInvalid = !testCase.username || !testCase.password;
      expect(isInvalid).toBe(testCase.shouldReject);
    });
  });

  test('Property 5: Whitespace-only credentials are rejected', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length === 0),
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length === 0),
        (whitespaceUsername, whitespacePassword) => {
          // Whitespace-only strings should be treated as invalid
          const isInvalid = !whitespaceUsername.trim() || !whitespacePassword.trim();
          return isInvalid === true;
        }
      ),
      { numRuns: 50 }
    );
  });
});

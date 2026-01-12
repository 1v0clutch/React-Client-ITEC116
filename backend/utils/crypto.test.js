const fc = require('fast-check');
const { encrypt, decrypt } = require('./crypto');

// Set up environment variable for testing
process.env.CRYPTO_SECRET = 'test-crypto-secret-key-for-testing-purposes-only';

describe('Crypto Utilities Property Tests', () => {
  /**
   * Feature: ecommerce-authentication, Property 12: Email encryption round-trip
   * Validates: Requirements 6.2, 6.4
   * 
   * For any valid email address, encrypting then decrypting should produce the original email address
   */
  test('Property 12: Email encryption round-trip - encrypt then decrypt returns original', () => {
    fc.assert(
      fc.property(
        fc.emailAddress(),
        (email) => {
          const encrypted = encrypt(email);
          const decrypted = decrypt(encrypted);
          return decrypted === email;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 12: Email encryption round-trip - handles empty strings', () => {
    const encrypted = encrypt('');
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe('');
  });

  test('Property 12: Email encryption round-trip - encrypted value differs from original', () => {
    fc.assert(
      fc.property(
        fc.emailAddress(),
        (email) => {
          const encrypted = encrypt(email);
          // Encrypted value should be different from original (unless empty)
          return email === '' || encrypted !== email;
        }
      ),
      { numRuns: 100 }
    );
  });
});

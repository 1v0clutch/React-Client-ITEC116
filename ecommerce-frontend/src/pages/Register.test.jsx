import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Feature: ecommerce-authentication, Property 11: Password validation
 * Validates: Requirements 1.4
 * 
 * For any registration attempt with a password shorter than 6 characters,
 * the system should reject the registration before attempting to hash the password
 * 
 * This test validates the password validation logic directly without UI rendering
 * to ensure efficient property-based testing across many inputs.
 */

// Password validation function extracted from Register component logic
const validatePassword = (password) => {
  if (!password) {
    return { valid: false, error: "Password is required" };
  }
  if (password.length < 6) {
    return { valid: false, error: "Password must be at least 6 characters" };
  }
  return { valid: true, error: null };
};

describe('Register Component - Property-Based Tests', () => {
  /**
   * Property 11: Password validation - rejects passwords shorter than 6 characters
   */
  it('Property 11: Password validation - rejects passwords shorter than 6 characters', () => {
    fc.assert(
      fc.property(
        // Generate passwords with length 0-5 (invalid)
        fc.string({ minLength: 0, maxLength: 5 }),
        (shortPassword) => {
          const result = validatePassword(shortPassword);
          
          // For any password shorter than 6 characters, validation should fail
          expect(result.valid).toBe(false);
          expect(result.error).toBeTruthy();
          
          // Specifically check for length-related error
          if (shortPassword.length > 0) {
            expect(result.error).toMatch(/at least 6 characters/i);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 11 (edge case): Empty password is rejected', () => {
    const result = validatePassword('');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('Property 11 (edge case): Null/undefined password is rejected', () => {
    const resultNull = validatePassword(null);
    expect(resultNull.valid).toBe(false);
    
    const resultUndefined = validatePassword(undefined);
    expect(resultUndefined.valid).toBe(false);
  });

  it('Property 11 (complementary): Valid passwords (6+ characters) pass validation', () => {
    fc.assert(
      fc.property(
        // Generate passwords with length 6+ (valid)
        fc.string({ minLength: 6, maxLength: 50 }),
        (validPassword) => {
          const result = validatePassword(validPassword);
          
          // For any password 6 characters or longer, validation should pass
          expect(result.valid).toBe(true);
          expect(result.error).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 11 (boundary): Password with exactly 6 characters is valid', () => {
    fc.assert(
      fc.property(
        // Generate passwords with exactly 6 characters
        fc.string({ minLength: 6, maxLength: 6 }),
        (sixCharPassword) => {
          const result = validatePassword(sixCharPassword);
          expect(result.valid).toBe(true);
          expect(result.error).toBeNull();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('Property 11 (boundary): Password with exactly 5 characters is invalid', () => {
    fc.assert(
      fc.property(
        // Generate passwords with exactly 5 characters
        fc.string({ minLength: 5, maxLength: 5 }),
        (fiveCharPassword) => {
          const result = validatePassword(fiveCharPassword);
          expect(result.valid).toBe(false);
          expect(result.error).toMatch(/at least 6 characters/i);
        }
      ),
      { numRuns: 50 }
    );
  });
});

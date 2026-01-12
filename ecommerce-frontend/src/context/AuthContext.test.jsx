import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import * as fc from 'fast-check';

/**
 * Feature: ecommerce-authentication, Property 10: Session persistence
 * 
 * For any valid JWT token stored in localStorage, when the page is refreshed,
 * the user should remain authenticated without requiring re-login
 * 
 * Validates: Requirements 8.1, 8.2, 8.3
 */
describe('Property 10: Session persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should persist authentication state across page refreshes for any valid token and user data', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary token strings (simulating JWT tokens)
        fc.string({ minLength: 20, maxLength: 200 }),
        // Generate arbitrary user objects
        fc.record({
          id: fc.string({ minLength: 10, maxLength: 50 }),
          fullName: fc.string({ minLength: 3, maxLength: 50 }),
          username: fc.string({ minLength: 3, maxLength: 30 }),
          email: fc.emailAddress(),
        }),
        (token, user) => {
          // Store token and user in localStorage (simulating a successful login)
          localStorage.setItem('authToken', token);
          localStorage.setItem('authUser', JSON.stringify(user));

          // Render the hook (simulating page refresh/mount)
          const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
          });

          // Wait for the effect to run
          act(() => {
            // Allow useEffect to complete
          });

          // Property: The authentication state should be restored from localStorage
          expect(result.current.token).toBe(token);
          expect(result.current.user).toEqual(user);
          expect(result.current.isAuthenticated()).toBe(true);

          // Cleanup
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle missing token gracefully', () => {
    // No token in localStorage
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    act(() => {
      // Allow useEffect to complete
    });

    expect(result.current.token).toBe(null);
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated()).toBe(false);
  });

  it('should handle corrupted user data gracefully', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 20, maxLength: 200 }),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => {
          try {
            JSON.parse(s);
            return false; // Valid JSON, skip
          } catch {
            return true; // Invalid JSON, use it
          }
        }),
        (token, corruptedUserData) => {
          localStorage.setItem('authToken', token);
          localStorage.setItem('authUser', corruptedUserData);

          const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
          });

          act(() => {
            // Allow useEffect to complete
          });

          // Property: Should handle corrupted data by clearing auth state
          expect(result.current.token).toBe(null);
          expect(result.current.user).toBe(null);
          expect(result.current.isAuthenticated()).toBe(false);
          
          // Should also clear localStorage
          expect(localStorage.getItem('authToken')).toBe(null);
          expect(localStorage.getItem('authUser')).toBe(null);

          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });
});

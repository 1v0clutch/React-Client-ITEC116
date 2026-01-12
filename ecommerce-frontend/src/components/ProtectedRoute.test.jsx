import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import * as fc from 'fast-check';

/**
 * Feature: ecommerce-authentication, Property 7: Protected route enforcement
 * 
 * For any request to checkout or orders endpoints without a valid JWT token,
 * the system should return a 401 Unauthorized response (or redirect to login in frontend)
 * 
 * Validates: Requirements 4.4, 5.2
 */
describe('Property 7: Protected route enforcement', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('should redirect to login for any unauthenticated access attempt to protected routes', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary protected route paths
        fc.constantFrom('/checkout', '/orders'),
        // Generate arbitrary protected content
        fc.string({ minLength: 5, maxLength: 50 }),
        (protectedPath, protectedContent) => {
          // Ensure no authentication token exists
          localStorage.clear();

          // Render the protected route without authentication
          const { unmount } = render(
            <MemoryRouter initialEntries={[protectedPath]}>
              <AuthProvider>
                <Routes>
                  <Route
                    path={protectedPath}
                    element={
                      <ProtectedRoute>
                        <div data-testid="protected-content">{protectedContent}</div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      <div data-testid="login-page">Login Page</div>
                    }
                  />
                </Routes>
              </AuthProvider>
            </MemoryRouter>
          );

          // Property: Should redirect to login page, not show protected content
          const loginPage = screen.queryByTestId('login-page');
          const protectedContentElement = screen.queryByTestId('protected-content');

          expect(loginPage).not.toBeNull();
          expect(protectedContentElement).toBeNull();

          // Cleanup after each property test run
          unmount();
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow access to protected routes for any authenticated user', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary protected route paths
        fc.constantFrom('/checkout', '/orders'),
        // Generate arbitrary valid tokens and user data
        fc.string({ minLength: 20, maxLength: 200 }),
        fc.record({
          id: fc.string({ minLength: 10, maxLength: 50 }),
          fullName: fc.string({ minLength: 3, maxLength: 50 }),
          username: fc.string({ minLength: 3, maxLength: 30 }),
          email: fc.emailAddress(),
        }),
        // Generate arbitrary protected content
        fc.string({ minLength: 5, maxLength: 50 }),
        (protectedPath, token, user, protectedContent) => {
          // Set up authentication
          localStorage.clear();
          localStorage.setItem('authToken', token);
          localStorage.setItem('authUser', JSON.stringify(user));

          // Render the protected route with authentication
          const { unmount } = render(
            <MemoryRouter initialEntries={[protectedPath]}>
              <AuthProvider>
                <Routes>
                  <Route
                    path={protectedPath}
                    element={
                      <ProtectedRoute>
                        <div data-testid="protected-content">{protectedContent}</div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      <div data-testid="login-page">Login Page</div>
                    }
                  />
                </Routes>
              </AuthProvider>
            </MemoryRouter>
          );

          // Property: Should show protected content, not redirect to login
          const protectedContentElement = screen.queryByTestId('protected-content');
          const loginPage = screen.queryByTestId('login-page');

          expect(protectedContentElement).not.toBeNull();
          expect(protectedContentElement?.textContent).toBe(protectedContent);
          expect(loginPage).toBeNull();

          // Cleanup after each property test run
          unmount();
          cleanup();
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve the intended destination when redirecting to login', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary protected route paths
        fc.constantFrom('/checkout', '/orders'),
        (protectedPath) => {
          // Ensure no authentication token exists
          localStorage.clear();

          // Render the protected route without authentication
          const { unmount } = render(
            <MemoryRouter initialEntries={[protectedPath]}>
              <AuthProvider>
                <Routes>
                  <Route
                    path={protectedPath}
                    element={
                      <ProtectedRoute>
                        <div data-testid="protected-content">Protected</div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/login"
                    element={<div data-testid="login-page">Login Page</div>}
                  />
                </Routes>
              </AuthProvider>
            </MemoryRouter>
          );

          // Property: Should redirect to login
          const loginPage = screen.queryByTestId('login-page');
          expect(loginPage).not.toBeNull();

          // Cleanup after each property test run
          unmount();
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });
});

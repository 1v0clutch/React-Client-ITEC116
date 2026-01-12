import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';

/**
 * Integration Test: Cart Persistence Through Login Flow
 * 
 * This test verifies that cart data in localStorage is preserved
 * when a user logs in, ensuring Requirement 3.5 is met.
 * 
 * Validates: Requirements 3.5
 */
describe('Cart Persistence Through Login Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should preserve cart data when user logs in', async () => {
    // Setup: Create a cart with items before login
    const cartBeforeLogin = [
      {
        productId: 'prod-123',
        name: 'Test Product 1',
        price: 29.99,
        quantity: 2,
      },
      {
        productId: 'prod-456',
        name: 'Test Product 2',
        price: 49.99,
        quantity: 1,
      },
    ];
    
    localStorage.setItem('cart', JSON.stringify(cartBeforeLogin));
    
    // Verify cart is stored
    const storedCartBefore = localStorage.getItem('cart');
    expect(storedCartBefore).toBeTruthy();
    expect(JSON.parse(storedCartBefore)).toEqual(cartBeforeLogin);
    
    // Mock successful login response
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            token: 'mock-jwt-token-12345',
            user: {
              id: 'user-789',
              fullName: 'Test User',
              username: 'testuser',
              email: 'test@example.com',
            },
          }),
      })
    );
    
    // Render AuthContext and perform login
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Perform login
    let loginResult;
    await act(async () => {
      loginResult = await result.current.login('testuser', 'password123');
    });
    
    // Verify login was successful
    expect(loginResult.success).toBe(true);
    expect(result.current.user).toBeTruthy();
    expect(result.current.token).toBeTruthy();
    
    // CRITICAL VERIFICATION: Cart should still be in localStorage after login
    const storedCartAfter = localStorage.getItem('cart');
    expect(storedCartAfter).toBeTruthy();
    expect(storedCartAfter).toBe(storedCartBefore);
    
    // Verify cart contents are unchanged
    const parsedCartAfter = JSON.parse(storedCartAfter);
    expect(parsedCartAfter).toEqual(cartBeforeLogin);
    expect(parsedCartAfter.length).toBe(2);
    expect(parsedCartAfter[0].productId).toBe('prod-123');
    expect(parsedCartAfter[1].productId).toBe('prod-456');
  });

  it('should preserve empty cart when user logs in', async () => {
    // Setup: Empty cart before login
    localStorage.setItem('cart', JSON.stringify([]));
    
    const storedCartBefore = localStorage.getItem('cart');
    expect(JSON.parse(storedCartBefore)).toEqual([]);
    
    // Mock successful login response
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            token: 'mock-jwt-token',
            user: {
              id: 'user-123',
              fullName: 'Test User',
              username: 'testuser',
              email: 'test@example.com',
            },
          }),
      })
    );
    
    // Render AuthContext and perform login
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.login('testuser', 'password123');
    });
    
    // Verify empty cart is preserved
    const storedCartAfter = localStorage.getItem('cart');
    expect(storedCartAfter).toBe(storedCartBefore);
    expect(JSON.parse(storedCartAfter)).toEqual([]);
  });

  it('should preserve cart with large quantity when user logs in', async () => {
    // Setup: Cart with large quantities
    const largeCart = [
      {
        productId: 'prod-999',
        name: 'Bulk Product',
        price: 5.99,
        quantity: 100,
      },
    ];
    
    localStorage.setItem('cart', JSON.stringify(largeCart));
    
    // Mock successful login response
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            token: 'mock-jwt-token',
            user: {
              id: 'user-456',
              fullName: 'Test User',
              username: 'testuser',
              email: 'test@example.com',
            },
          }),
      })
    );
    
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.login('testuser', 'password123');
    });
    
    // Verify large quantity cart is preserved
    const storedCartAfter = localStorage.getItem('cart');
    const parsedCart = JSON.parse(storedCartAfter);
    expect(parsedCart).toEqual(largeCart);
    expect(parsedCart[0].quantity).toBe(100);
  });

  it('should not create cart if none existed before login', async () => {
    // Setup: No cart in localStorage
    expect(localStorage.getItem('cart')).toBeNull();
    
    // Mock successful login response
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            token: 'mock-jwt-token',
            user: {
              id: 'user-789',
              fullName: 'Test User',
              username: 'testuser',
              email: 'test@example.com',
            },
          }),
      })
    );
    
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.login('testuser', 'password123');
    });
    
    // Verify no cart was created during login
    expect(localStorage.getItem('cart')).toBeNull();
  });

  it('should preserve cart through failed login attempt', async () => {
    // Setup: Cart exists before failed login
    const cartData = [
      {
        productId: 'prod-111',
        name: 'Product',
        price: 19.99,
        quantity: 1,
      },
    ];
    
    localStorage.setItem('cart', JSON.stringify(cartData));
    const cartBefore = localStorage.getItem('cart');
    
    // Mock failed login response
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({
            message: 'Invalid credentials',
          }),
      })
    );
    
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    let loginResult;
    await act(async () => {
      loginResult = await result.current.login('wronguser', 'wrongpass');
    });
    
    // Verify login failed
    expect(loginResult.success).toBe(false);
    
    // CRITICAL: Cart should still be preserved even after failed login
    const cartAfter = localStorage.getItem('cart');
    expect(cartAfter).toBe(cartBefore);
    expect(JSON.parse(cartAfter)).toEqual(cartData);
  });
});

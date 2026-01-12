import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProductCatalog from './ProductCatalog';
import ShoppingCart from './ShoppingCart';
import userEvent from '@testing-library/user-event';

// Mock fetch globally
global.fetch = vi.fn();

// Helper to wrap components with necessary providers
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Guest Browsing Functionality - Requirements 3.1, 3.2, 3.3', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('11.1 Test guest access to public pages', () => {
    it('should load ProductCatalog without authentication', async () => {
      // Mock the products API response
      const mockProducts = [
        {
          _id: '1',
          name: 'Test Product 1',
          sku: 'SKU001',
          price: 100,
          quantity: 10,
          category: 'Electronics',
          description: 'Test description'
        },
        {
          _id: '2',
          name: 'Test Product 2',
          sku: 'SKU002',
          price: 200,
          quantity: 5,
          category: 'Books',
          description: 'Another test'
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      });

      // Verify no token exists (guest user)
      expect(localStorage.getItem('token')).toBeNull();

      // Render ProductCatalog
      renderWithProviders(<ProductCatalog />);

      // Wait for products to load
      await waitFor(() => {
        expect(screen.getByText('Product Catalog')).toBeInTheDocument();
      });

      // Verify products are displayed
      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
        expect(screen.getByText('Test Product 2')).toBeInTheDocument();
      });

      // Verify the API was called without authentication header
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/ecommerce/products/all')
      );
    });

    it('should load ShoppingCart without authentication', async () => {
      // Add items to cart in localStorage (simulating guest cart)
      const guestCart = [
        {
          productId: '1',
          name: 'Guest Product',
          quantity: 2,
          price: 50,
          availableStock: 10
        }
      ];
      localStorage.setItem('cart', JSON.stringify(guestCart));

      // Verify no token exists (guest user)
      expect(localStorage.getItem('token')).toBeNull();

      // Render ShoppingCart
      renderWithProviders(<ShoppingCart />);

      // Verify cart page loads
      expect(screen.getByText('Shopping Cart')).toBeInTheDocument();

      // Verify cart items are displayed
      await waitFor(() => {
        expect(screen.getByText('Guest Product')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });

    it('should allow adding items to cart without authentication', async () => {
      const user = userEvent.setup();
      
      const mockProduct = {
        _id: 'product123',
        name: 'Laptop',
        sku: 'LAP001',
        price: 999,
        quantity: 15,
        category: 'Electronics',
        description: 'High-end laptop'
      };

      // Mock products list API
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockProduct]
      });

      // Verify no token exists (guest user)
      expect(localStorage.getItem('token')).toBeNull();

      // Render ProductCatalog
      renderWithProviders(<ProductCatalog />);

      // Wait for product to load
      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
      });

      // Mock the stock check API for adding to cart
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProduct
      });

      // Find and click "Add to Cart" button
      const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
      await user.click(addToCartButton);

      // Verify item was added to localStorage cart
      await waitFor(() => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        expect(cart).toHaveLength(1);
        expect(cart[0].productId).toBe('product123');
        expect(cart[0].name).toBe('Laptop');
        expect(cart[0].quantity).toBe(1);
      });

      // Verify success toast appears
      await waitFor(() => {
        expect(screen.getByText(/added to cart/i)).toBeInTheDocument();
      });
    });

    it('should display empty cart message for guest with no items', () => {
      // Verify no token exists (guest user)
      expect(localStorage.getItem('token')).toBeNull();
      
      // Verify cart is empty
      expect(localStorage.getItem('cart')).toBeNull();

      // Render ShoppingCart
      renderWithProviders(<ShoppingCart />);

      // Verify empty cart message is displayed
      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
      expect(screen.getByText('Browse Products')).toBeInTheDocument();
    });

    it('should allow guest to view cart with multiple items', () => {
      const guestCart = [
        {
          productId: '1',
          name: 'Product A',
          quantity: 2,
          price: 100,
          availableStock: 20
        },
        {
          productId: '2',
          name: 'Product B',
          quantity: 1,
          price: 50,
          availableStock: 10
        }
      ];
      localStorage.setItem('cart', JSON.stringify(guestCart));

      // Verify no token exists (guest user)
      expect(localStorage.getItem('token')).toBeNull();

      // Render ShoppingCart
      renderWithProviders(<ShoppingCart />);

      // Verify both products are displayed
      expect(screen.getByText('Product A')).toBeInTheDocument();
      expect(screen.getByText('Product B')).toBeInTheDocument();

      // Verify total is calculated correctly
      expect(screen.getByText('₱250.00')).toBeInTheDocument(); // (100*2) + (50*1)
    });
  });
});

describe('Property-Based Tests', () => {
  describe('11.2 Property 6: Guest browsing access', () => {
    it('Property 6: For any unauthenticated user, product catalog and cart pages should be accessible without requiring a token - Validates: Requirements 3.1, 3.2, 3.3', async () => {
      const fc = await import('fast-check');

      // Property: For any set of products and cart items, guest users can access catalog and cart
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary product data
          fc.array(
            fc.record({
              _id: fc.string({ minLength: 24, maxLength: 24 }).map(s => 
                s.split('').map(c => '0123456789abcdef'[Math.abs(c.charCodeAt(0)) % 16]).join('')
              ),
              name: fc.string({ minLength: 1, maxLength: 50 }),
              sku: fc.string({ minLength: 3, maxLength: 20 }),
              price: fc.integer({ min: 1, max: 10000 }),
              quantity: fc.integer({ min: 0, max: 1000 }),
              category: fc.constantFrom('Electronics', 'Books', 'Clothing', 'Food', 'Toys'),
              description: fc.string({ maxLength: 200 })
            }),
            { minLength: 0, maxLength: 10 }
          ),
          // Generate arbitrary cart data
          fc.array(
            fc.record({
              productId: fc.string({ minLength: 24, maxLength: 24 }).map(s => 
                s.split('').map(c => '0123456789abcdef'[Math.abs(c.charCodeAt(0)) % 16]).join('')
              ),
              name: fc.string({ minLength: 1, maxLength: 50 }),
              quantity: fc.integer({ min: 1, max: 100 }),
              price: fc.integer({ min: 1, max: 10000 }),
              availableStock: fc.integer({ min: 0, max: 1000 })
            }),
            { minLength: 0, maxLength: 20 }
          ),
          async (products, cartItems) => {
            // Clear localStorage to ensure no authentication token exists
            localStorage.clear();
            
            // Verify no token exists (guest user)
            expect(localStorage.getItem('token')).toBeNull();

            // Test 1: Product Catalog should be accessible
            fetch.mockResolvedValueOnce({
              ok: true,
              json: async () => products
            });

            const { unmount: unmountCatalog } = renderWithProviders(<ProductCatalog />);

            // Verify catalog loads without authentication
            await waitFor(() => {
              expect(screen.getByText('Product Catalog')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Verify fetch was called without Authorization header
            const catalogCall = fetch.mock.calls.find(call => 
              call[0]?.includes('/api/ecommerce/products/all')
            );
            expect(catalogCall).toBeDefined();
            
            // If there's a second argument (options), verify no Authorization header
            if (catalogCall && catalogCall[1]) {
              expect(catalogCall[1].headers?.Authorization).toBeUndefined();
            }

            unmountCatalog();
            vi.clearAllMocks();

            // Test 2: Shopping Cart should be accessible
            localStorage.setItem('cart', JSON.stringify(cartItems));
            
            const { unmount: unmountCart } = renderWithProviders(<ShoppingCart />);

            // Verify cart loads without authentication
            await waitFor(() => {
              expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Verify cart displays correctly based on items
            if (cartItems.length === 0) {
              expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
            } else {
              // At least one item should be visible
              expect(screen.getByText('Continue Shopping')).toBeInTheDocument();
            }

            unmountCart();
            localStorage.clear();
          }
        ),
        { 
          numRuns: 100,
          verbose: false
        }
      );
    });
  });
});

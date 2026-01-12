// Set up environment variables for testing BEFORE requiring modules
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only-minimum-32-chars';
process.env.CRYPTO_SECRET = 'test-crypto-secret-key-for-testing-purposes-only';

const fc = require('fast-check');
const mongoose = require('mongoose');

// Mock the models before requiring the controller
jest.mock('../models/OnlineOrder');
jest.mock('../models/User');
jest.mock('../models/Customer');
jest.mock('../models/Inventory');
jest.mock('../models/SalesOrder');

const OnlineOrder = require('../models/OnlineOrder');
const { getAllOrders } = require('./ecommerce.controller');

describe('E-Commerce Controller Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Feature: ecommerce-authentication, Property 8: User-specific order isolation
   * Validates: Requirements 5.1
   * 
   * For any authenticated user requesting their orders, 
   * the system should return only orders where the userId matches the authenticated user's ID
   */
  test('Property 8: User-specific order isolation - returns only user orders', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // Generate random user ID
        fc.array(
          fc.record({
            orderId: fc.uuid(),
            orderNumber: fc.string({ minLength: 5, maxLength: 20 }),
            totalAmount: fc.integer({ min: 1, max: 10000 }),
          }),
          { minLength: 1, maxLength: 10 }
        ), // Generate random orders for this user
        fc.array(
          fc.record({
            orderId: fc.uuid(),
            userId: fc.uuid(),
            orderNumber: fc.string({ minLength: 5, maxLength: 20 }),
            totalAmount: fc.integer({ min: 1, max: 10000 }),
          }),
          { minLength: 1, maxLength: 10 }
        ), // Generate random orders for other users
        async (userId, userOrders, otherOrders) => {
          // Create mock orders with userId
          const mockUserOrders = userOrders.map(order => ({
            _id: order.orderId,
            userId: userId,
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            items: [],
            status: 'pending',
          }));

          // Mock the database query to return only orders for this user
          // Need to chain multiple populate calls
          const mockQuery = {
            populate: jest.fn().mockReturnThis(),
          };
          // The last populate call should resolve with the data
          mockQuery.populate.mockImplementation(() => {
            // Check if this is the last populate call (4th one)
            if (mockQuery.populate.mock.calls.length >= 4) {
              return Promise.resolve(mockUserOrders);
            }
            return mockQuery;
          });
          
          OnlineOrder.find = jest.fn().mockReturnValue(mockQuery);

          // Mock request with authenticated user
          const req = {
            userId: userId,
          };
          const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
          };

          await getAllOrders(req, res);

          // Verify OnlineOrder.find was called with correct filter
          expect(OnlineOrder.find).toHaveBeenCalledWith({ userId });

          // Verify response was called with json
          expect(res.json).toHaveBeenCalled();
          const returnedOrders = res.json.mock.calls[0][0];

          // Check if returnedOrders is an array (not an error object)
          if (!Array.isArray(returnedOrders)) {
            console.log('Returned orders is not an array:', returnedOrders);
            return false;
          }

          // All returned orders should belong to this user
          const allBelongToUser = returnedOrders.every(order => 
            order.userId === userId
          );

          // Should return exactly the expected number of orders
          const correctCount = returnedOrders.length === mockUserOrders.length;

          if (!allBelongToUser || !correctCount) {
            console.log('Test failed for user:', userId);
            console.log('Expected orders:', mockUserOrders.length);
            console.log('Returned orders:', returnedOrders.length);
            console.log('All belong to user:', allBelongToUser);
            console.log('Correct count:', correctCount);
            return false;
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 8: User-specific order isolation - returns empty array for user with no orders', async () => {
    const userId = 'user-with-no-orders';

    // Mock the database query to return empty array
    const mockQuery = {
      populate: jest.fn().mockReturnThis(),
    };
    // The last populate call should resolve with empty array
    mockQuery.populate.mockImplementation(() => {
      if (mockQuery.populate.mock.calls.length >= 4) {
        return Promise.resolve([]);
      }
      return mockQuery;
    });
    
    OnlineOrder.find = jest.fn().mockReturnValue(mockQuery);

    // Request orders for user with no orders
    const req = {
      userId: userId,
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await getAllOrders(req, res);

    // Verify OnlineOrder.find was called with correct filter
    expect(OnlineOrder.find).toHaveBeenCalledWith({ userId });

    const returnedOrders = res.json.mock.calls[0][0];
    expect(returnedOrders).toEqual([]);
  });

  test('Property 8: User-specific order isolation - different users get different orders', async () => {
    const user1Id = 'user-1';
    const user2Id = 'user-2';

    const user1Orders = [
      { _id: 'order-1', userId: user1Id, orderNumber: 'ORD-1', totalAmount: 100 },
      { _id: 'order-2', userId: user1Id, orderNumber: 'ORD-2', totalAmount: 200 },
    ];

    const user2Orders = [
      { _id: 'order-3', userId: user2Id, orderNumber: 'ORD-3', totalAmount: 300 },
    ];

    // Test user 1
    const mockQuery1 = {
      populate: jest.fn().mockReturnThis(),
    };
    mockQuery1.populate.mockImplementation(() => {
      if (mockQuery1.populate.mock.calls.length >= 4) {
        return Promise.resolve(user1Orders);
      }
      return mockQuery1;
    });
    OnlineOrder.find = jest.fn().mockReturnValue(mockQuery1);

    const req1 = { userId: user1Id };
    const res1 = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await getAllOrders(req1, res1);

    expect(OnlineOrder.find).toHaveBeenCalledWith({ userId: user1Id });
    expect(res1.json).toHaveBeenCalledWith(user1Orders);

    // Test user 2
    const mockQuery2 = {
      populate: jest.fn().mockReturnThis(),
    };
    mockQuery2.populate.mockImplementation(() => {
      if (mockQuery2.populate.mock.calls.length >= 4) {
        return Promise.resolve(user2Orders);
      }
      return mockQuery2;
    });
    OnlineOrder.find = jest.fn().mockReturnValue(mockQuery2);

    const req2 = { userId: user2Id };
    const res2 = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await getAllOrders(req2, res2);

    expect(OnlineOrder.find).toHaveBeenCalledWith({ userId: user2Id });
    expect(res2.json).toHaveBeenCalledWith(user2Orders);
  });
});

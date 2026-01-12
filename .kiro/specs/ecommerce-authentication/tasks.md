# Implementation Plan

- [x] 1. Set up backend authentication infrastructure





  - Copy User model, crypto utilities, and auth routes from Wheels to main backend
  - Add JWT_SECRET and CRYPTO_SECRET to backend/.env
  - Register auth routes in main backend server
  - _Requirements: 6.1, 6.2, 7.1, 7.2, 7.3_

- [x] 1.1 Copy User model to main backend


  - Create backend/models/User.js with schema from Wheels
  - Include fullName, username, passwordHash, encryptedEmail fields
  - _Requirements: 6.1, 6.2_

- [x] 1.2 Copy crypto utilities to main backend


  - Create backend/utils/crypto.js with encrypt/decrypt functions
  - Use AES-256 encryption for email addresses
  - _Requirements: 6.2, 6.4_

- [x] 1.3 Write property test for email encryption


  - **Property 12: Email encryption round-trip**
  - **Validates: Requirements 6.2, 6.4**

- [x] 1.4 Copy authentication routes to main backend


  - Create backend/routes/auth.js with register and login endpoints
  - Implement password hashing with bcrypt (salt rounds: 12)
  - Implement JWT token generation with 6-hour expiration
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 6.1, 6.3, 6.5_

- [x] 1.5 Write property test for password hashing


  - **Property 1: Password hashing is irreversible**
  - **Validates: Requirements 6.1, 6.3, 6.5**

- [x] 1.6 Write property test for duplicate username rejection


  - **Property 2: Duplicate username rejection**
  - **Validates: Requirements 1.2**

- [x] 1.7 Write property test for duplicate email rejection


  - **Property 3: Duplicate email rejection**
  - **Validates: Requirements 1.3**

- [x] 1.8 Register auth routes in main backend server


  - Add app.use('/api/auth', authRoutes) to backend/server.js
  - Ensure routes are registered before other routes
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 1.9 Add environment variables to backend


  - Add JWT_SECRET to backend/.env (minimum 32 characters)
  - Add CRYPTO_SECRET to backend/.env for email encryption
  - _Requirements: 6.1, 6.2_

- [x] 2. Create authentication middleware





  - Implement JWT token verification middleware
  - Extract user ID from valid tokens
  - Return 401 for invalid or missing tokens
  - _Requirements: 2.1, 4.4, 5.2_

- [x] 2.1 Implement JWT verification middleware


  - Create backend/middleware/auth.js
  - Verify token signature and expiration
  - Attach user ID to request object
  - _Requirements: 2.1, 4.4, 5.2_

- [x] 2.2 Write property test for JWT authentication


  - **Property 4: JWT token authentication**
  - **Validates: Requirements 2.1, 2.3**

- [x] 2.3 Write property test for invalid credentials rejection


  - **Property 5: Invalid credentials rejection**
  - **Validates: Requirements 2.2**

- [x] 3. Update Order model and e-commerce routes




  - Add userId field to Order schema
  - Protect checkout and order routes with auth middleware
  - Filter orders by authenticated user
  - _Requirements: 4.2, 4.3, 5.1_

- [x] 3.1 Update Order model with userId field


  - Add userId field to backend/models/Order.js (if exists) or ecommerce schema
  - Make userId required for new orders
  - Add index on userId for query performance
  - _Requirements: 4.2, 4.3_

- [x] 3.2 Protect order creation endpoint


  - Apply auth middleware to POST /api/ecommerce/orders
  - Extract userId from authenticated request
  - Include userId when creating order
  - _Requirements: 4.2, 4.3, 4.4_

- [x] 3.3 Protect order retrieval endpoint


  - Apply auth middleware to GET /api/ecommerce/orders
  - Filter orders by authenticated user's ID
  - Return only orders belonging to the user
  - _Requirements: 5.1, 5.2_

- [x] 3.4 Write property test for user order isolation


  - **Property 8: User-specific order isolation**
  - **Validates: Requirements 5.1**

- [x] 4. Checkpoint - Verify backend authentication works





  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create frontend authentication context





  - Implement React Context for global auth state
  - Manage token storage in localStorage
  - Provide login, logout, and user data to components
  - _Requirements: 2.3, 8.1, 8.2, 8.3, 8.5_

- [x] 5.1 Create AuthContext component


  - Create ecommerce-frontend/src/context/AuthContext.jsx
  - Implement login, logout, and token management functions
  - Store and retrieve JWT token from localStorage
  - Provide user state to all components
  - _Requirements: 2.3, 8.1, 8.2, 8.3, 8.5_

- [x] 5.2 Write property test for session persistence


  - **Property 10: Session persistence**
  - **Validates: Requirements 8.1, 8.2, 8.3**

- [x] 5.3 Wrap App with AuthProvider


  - Update ecommerce-frontend/src/main.jsx or App.jsx
  - Wrap application with AuthProvider
  - _Requirements: 8.1, 8.2_

- [x] 6. Create authentication UI components





  - Build Login and Register pages
  - Add form validation and error handling
  - Style to match existing e-commerce design
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2_

- [x] 6.1 Create Login page component


  - Create ecommerce-frontend/src/pages/Login.jsx
  - Implement login form with username and password fields
  - Call /api/auth/login endpoint
  - Store token and user data on success
  - Display error messages on failure
  - _Requirements: 2.1, 2.2_

- [x] 6.2 Create Register page component


  - Create ecommerce-frontend/src/pages/Register.jsx
  - Implement registration form with all required fields
  - Validate password length (minimum 6 characters)
  - Validate password confirmation match
  - Call /api/auth/register endpoint
  - Redirect to login on success
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 6.3 Write property test for password validation


  - **Property 11: Password validation**
  - **Validates: Requirements 1.4**

- [x] 7. Create ProtectedRoute component




  - Implement route wrapper for authentication checks
  - Redirect unauthenticated users to login
  - Preserve intended destination for post-login redirect
  - _Requirements: 4.4, 5.2_

- [x] 7.1 Implement ProtectedRoute wrapper


  - Create ecommerce-frontend/src/components/ProtectedRoute.jsx
  - Check for valid token before rendering
  - Redirect to /login if not authenticated
  - _Requirements: 4.4, 5.2_

- [x] 7.2 Write property test for protected route enforcement


  - **Property 7: Protected route enforcement**
  - **Validates: Requirements 4.4, 5.2**

- [x] 8. Update App routing and navigation




  - Add login and register routes
  - Wrap checkout and orders with ProtectedRoute
  - Update header with auth UI
  - _Requirements: 2.4, 2.5, 3.4, 4.4, 5.2_

- [x] 8.1 Add authentication routes to App


  - Update ecommerce-frontend/src/App.jsx
  - Add /login and /register routes
  - Wrap /checkout and /orders with ProtectedRoute
  - _Requirements: 4.4, 5.2_

- [x] 8.2 Update Header component with auth UI


  - Modify Header in ecommerce-frontend/src/App.jsx
  - Show Login/Register buttons when not authenticated
  - Show user name and Logout button when authenticated
  - _Requirements: 2.4, 2.5_

- [x] 8.3 Implement logout functionality


  - Add logout handler to AuthContext
  - Clear token from localStorage
  - Reset user state
  - Redirect to home page
  - _Requirements: 2.5, 8.5_

- [x] 9. Update checkout flow with authentication



  - Ensure checkout requires authentication
  - Include user ID in order creation
  - Preserve cart contents after login
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 3.5_

- [x] 9.1 Update Checkout page to use auth


  - Modify ecommerce-frontend/src/pages/Checkout.jsx
  - Get user data from AuthContext
  - Include Authorization header in order API call
  - Handle authentication errors
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 9.2 Write property test for cart preservation


  - **Property 9: Cart preservation after login**
  - **Validates: Requirements 3.5**

- [x] 9.3 Verify cart persists through login flow


  - Test that cart data in localStorage is preserved
  - Ensure cart contents remain after authentication
  - _Requirements: 3.5_

- [x] 10. Update order management with user filtering
  - Fetch only authenticated user's orders
  - Display user-specific order history
  - Handle empty order state
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 10.1 Update OrderManagement page to use auth
  - Modify ecommerce-frontend/src/pages/OrderManagement.jsx
  - Include Authorization header in orders API call
  - Display only user's orders
  - Show appropriate message when no orders exist
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 11. Verify guest browsing functionality
  - Test product catalog access without login
  - Test cart functionality without login
  - Ensure public routes remain accessible
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 11.1 Test guest access to public pages
  - Verify ProductCatalog loads without authentication
  - Verify ShoppingCart loads without authentication
  - Verify add to cart works without authentication
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 11.2 Write property test for guest browsing access
  - **Property 6: Guest browsing access**
  - **Validates: Requirements 3.1, 3.2, 3.3**

- [x] 12. Final checkpoint - Complete end-to-end testing
  - Ensure all tests pass, ask the user if questions arise.

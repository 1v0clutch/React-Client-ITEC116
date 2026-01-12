# Design Document

## Overview

This design integrates the Wheels authentication system into the Module 6 E-Commerce application by migrating authentication components to the main backend and adding login/register UI to the e-commerce frontend. The solution maintains separation of concerns while providing a unified user experience. Authentication will be JWT-based with bcrypt password hashing, and the system will support both guest browsing and authenticated checkout flows.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    E-Commerce Frontend                       │
│                     (React + Vite)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Public     │  │    Auth      │  │  Protected   │     │
│  │   Routes     │  │   Routes     │  │   Routes     │     │
│  │ - Catalog    │  │ - Login      │  │ - Checkout   │     │
│  │ - Cart       │  │ - Register   │  │ - Orders     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/JSON + JWT
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Main Backend (Express - Port 8000)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Auth       │  │  E-Commerce  │  │     ERP      │     │
│  │   Routes     │  │   Routes     │  │   Routes     │     │
│  │ /api/auth/*  │  │/api/ecommerce│  │  /api/*      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   MongoDB       │
                    │  - users        │
                    │  - orders       │
                    │  - products     │
                    └─────────────────┘
```

### Authentication Flow

1. **Registration Flow:**
   - User submits registration form → Frontend validates → POST /api/auth/register
   - Backend validates, hashes password, encrypts email → Saves to MongoDB
   - Returns success message → Frontend redirects to login

2. **Login Flow:**
   - User submits credentials → POST /api/auth/login
   - Backend validates, generates JWT → Returns token + user data
   - Frontend stores token in localStorage → Updates UI state

3. **Protected Route Access:**
   - User navigates to protected page → Frontend checks for token
   - If no token → Redirect to login
   - If token exists → Include in Authorization header → Backend validates
   - If valid → Process request | If invalid → Return 401

## Components and Interfaces

### Backend Components

#### 1. User Model (`backend/models/User.js`)
```javascript
{
  fullName: String (required),
  username: String (required, unique),
  passwordHash: String (required),
  encryptedEmail: String,
  createdAt: Date (default: now)
}
```

#### 2. Authentication Routes (`backend/routes/auth.js`)
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user and return JWT

#### 3. Crypto Utilities (`backend/utils/crypto.js`)
- `encrypt(text)` - Encrypts email addresses
- `decrypt(encryptedText)` - Decrypts email addresses

#### 4. Authentication Middleware (`backend/middleware/auth.js`)
- `verifyToken(req, res, next)` - Validates JWT tokens for protected routes

### Frontend Components

#### 1. Authentication Pages
- `LoginPage.jsx` - User login interface
- `RegisterPage.jsx` - User registration interface

#### 2. Authentication Context (`AuthContext.jsx`)
- Manages authentication state globally
- Provides login, logout, and user data to all components
- Handles token storage and retrieval

#### 3. Protected Route Component (`ProtectedRoute.jsx`)
- Wraps routes requiring authentication
- Redirects unauthenticated users to login

#### 4. Updated Header Component
- Displays login/register buttons when not authenticated
- Shows user name and logout button when authenticated

### API Interfaces

#### Registration Endpoint
```
POST /api/auth/register
Request Body: {
  fullName: string,
  username: string,
  email: string,
  password: string,
  confirmPassword: string
}
Response: {
  message: string,
  userId: string
}
```

#### Login Endpoint
```
POST /api/auth/login
Request Body: {
  username: string,
  password: string
}
Response: {
  message: string,
  token: string,
  user: {
    id: string,
    fullName: string,
    username: string,
    email: string
  }
}
```

#### Protected E-Commerce Endpoints
```
POST /api/ecommerce/orders
Headers: { Authorization: "Bearer <token>" }
Request Body: {
  items: Array,
  totalAmount: number,
  shippingAddress: object
}
Response: {
  orderId: string,
  orderNumber: string,
  status: string
}

GET /api/ecommerce/orders
Headers: { Authorization: "Bearer <token>" }
Response: {
  orders: Array<Order>
}
```

## Data Models

### User Schema
```javascript
{
  _id: ObjectId,
  fullName: String,
  username: String (unique, indexed),
  passwordHash: String,
  encryptedEmail: String,
  createdAt: Date
}
```

### Order Schema (Updated)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'), // NEW FIELD
  orderNumber: String,
  items: [{
    productId: ObjectId,
    name: String,
    price: Number,
    quantity: Number
  }],
  totalAmount: Number,
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    postalCode: String,
    phone: String
  },
  status: String (enum: ['pending', 'processing', 'shipped', 'delivered']),
  createdAt: Date
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Password hashing is irreversible
*For any* valid password string, after hashing with bcrypt, the original password cannot be recovered from the hash, and verification must use bcrypt.compare()
**Validates: Requirements 6.1, 6.3, 6.5**

### Property 2: Duplicate username rejection
*For any* registration attempt with an existing username, the system should reject the registration and return an error, regardless of other field values
**Validates: Requirements 1.2**

### Property 3: Duplicate email rejection
*For any* registration attempt with an existing email, the system should reject the registration and return an error, regardless of other field values
**Validates: Requirements 1.3**

### Property 4: JWT token authentication
*For any* valid JWT token, when included in the Authorization header, the system should successfully authenticate the request and extract the user ID
**Validates: Requirements 2.1, 2.3**

### Property 5: Invalid credentials rejection
*For any* login attempt with incorrect username or password, the system should reject the login and not generate a token
**Validates: Requirements 2.2**

### Property 6: Guest browsing access
*For any* unauthenticated user, the product catalog and cart pages should be accessible without requiring a token
**Validates: Requirements 3.1, 3.2, 3.3**

### Property 7: Protected route enforcement
*For any* request to checkout or orders endpoints without a valid JWT token, the system should return a 401 Unauthorized response
**Validates: Requirements 4.4, 5.2**

### Property 8: User-specific order isolation
*For any* authenticated user requesting their orders, the system should return only orders where the userId matches the authenticated user's ID
**Validates: Requirements 5.1**

### Property 9: Cart preservation after login
*For any* cart state stored in localStorage before login, after successful authentication, the cart contents should remain unchanged
**Validates: Requirements 3.5**

### Property 10: Session persistence
*For any* valid JWT token stored in localStorage, when the page is refreshed, the user should remain authenticated without requiring re-login
**Validates: Requirements 8.1, 8.2, 8.3**

### Property 11: Password validation
*For any* registration attempt with a password shorter than 6 characters, the system should reject the registration before attempting to hash the password
**Validates: Requirements 1.4**

### Property 12: Email encryption round-trip
*For any* valid email address, encrypting then decrypting should produce the original email address
**Validates: Requirements 6.2, 6.4**

## Error Handling

### Backend Error Handling

1. **Validation Errors (400 Bad Request)**
   - Missing required fields
   - Password too short
   - Password mismatch
   - Invalid email format

2. **Authentication Errors (401 Unauthorized)**
   - Invalid credentials
   - Missing JWT token
   - Expired JWT token
   - Invalid JWT token

3. **Conflict Errors (409 Conflict)**
   - Duplicate username
   - Duplicate email

4. **Server Errors (500 Internal Server Error)**
   - Database connection failures
   - Encryption/decryption errors
   - Unexpected exceptions

### Frontend Error Handling

1. **Form Validation**
   - Display inline error messages for invalid inputs
   - Prevent submission until all fields are valid
   - Show password strength indicator

2. **Network Errors**
   - Display user-friendly error messages
   - Provide retry mechanisms
   - Handle timeout scenarios

3. **Authentication Errors**
   - Clear invalid tokens from localStorage
   - Redirect to login page
   - Display appropriate error messages

4. **Protected Route Access**
   - Redirect unauthenticated users to login
   - Preserve intended destination for post-login redirect
   - Display "Please log in" messages

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples and edge cases:

1. **Password Hashing**
   - Test that identical passwords produce different hashes (due to salt)
   - Test that bcrypt.compare correctly validates passwords
   - Test rejection of empty passwords

2. **Email Encryption**
   - Test encryption produces different output than input
   - Test decryption recovers original email
   - Test handling of invalid encrypted data

3. **JWT Token Generation**
   - Test token contains correct user ID and username
   - Test token has correct expiration time
   - Test token signature is valid

4. **Form Validation**
   - Test password length validation
   - Test password match validation
   - Test email format validation
   - Test required field validation

### Property-Based Testing

Property-based tests will verify universal properties across many inputs using **fast-check** (JavaScript PBT library):

1. **Property 1: Password Hashing Irreversibility**
   - Generate random password strings
   - Hash each password
   - Verify original password cannot be extracted from hash
   - Verify bcrypt.compare returns true for correct password

2. **Property 2: Duplicate Username Rejection**
   - Generate random user data
   - Create user in database
   - Attempt to create another user with same username
   - Verify second registration is rejected

3. **Property 3: JWT Authentication**
   - Generate random user IDs
   - Create JWT tokens for each
   - Verify each token can be decoded to retrieve original user ID
   - Verify tampered tokens are rejected

4. **Property 4: User Order Isolation**
   - Generate random users and orders
   - Assign orders to users
   - For each user, query their orders
   - Verify returned orders only belong to that user

5. **Property 5: Cart Preservation**
   - Generate random cart states
   - Store in localStorage
   - Simulate login
   - Verify cart state is unchanged

6. **Property 6: Email Encryption Round-Trip**
   - Generate random email addresses
   - Encrypt then decrypt each
   - Verify result equals original email

### Integration Testing

1. **Registration Flow**
   - Test complete registration from form submission to database storage
   - Verify password is hashed
   - Verify email is encrypted
   - Verify user can log in after registration

2. **Login Flow**
   - Test complete login from form submission to token storage
   - Verify token is valid
   - Verify user data is returned
   - Verify UI updates correctly

3. **Protected Route Access**
   - Test accessing checkout without token redirects to login
   - Test accessing checkout with valid token succeeds
   - Test accessing orders returns user-specific data

4. **End-to-End Order Flow**
   - Test guest adds items to cart
   - Test guest proceeds to checkout and is redirected to login
   - Test user logs in and cart is preserved
   - Test user completes checkout
   - Test order appears in user's order history

## Security Considerations

1. **Password Security**
   - Use bcrypt with salt rounds of 12
   - Never log or transmit passwords in plain text
   - Implement password strength requirements

2. **Token Security**
   - Use strong JWT secret (minimum 32 characters)
   - Set reasonable token expiration (6 hours)
   - Validate token signature on every request
   - Include only necessary data in token payload

3. **Email Privacy**
   - Encrypt emails using AES-256
   - Store encryption key in environment variables
   - Never expose encryption key in client-side code

4. **API Security**
   - Validate all input data
   - Use CORS to restrict API access
   - Implement rate limiting for auth endpoints
   - Sanitize error messages to avoid information leakage

5. **Frontend Security**
   - Store tokens in localStorage (not cookies to avoid CSRF)
   - Clear tokens on logout
   - Validate token expiration before making requests
   - Use HTTPS in production

## Migration Strategy

### Phase 1: Backend Integration
1. Copy User model to main backend
2. Copy crypto utilities to main backend
3. Copy auth routes to main backend
4. Create auth middleware
5. Update Order model to include userId
6. Test auth endpoints

### Phase 2: Frontend Integration
1. Create AuthContext for state management
2. Create Login and Register pages
3. Create ProtectedRoute component
4. Update App.jsx with new routes
5. Update Header with auth UI
6. Test authentication flow

### Phase 3: E-Commerce Integration
1. Update checkout to require authentication
2. Update order creation to include userId
3. Update order retrieval to filter by userId
4. Test complete order flow
5. Verify cart preservation

### Phase 4: Testing & Validation
1. Run unit tests
2. Run property-based tests
3. Run integration tests
4. Perform manual testing
5. Fix any issues

## Implementation Notes

1. **No Changes to Existing Modules**
   - Inventory, warehouse, finance, HR, and other ERP modules remain untouched
   - Only e-commerce routes are modified to add authentication

2. **Backward Compatibility**
   - Existing e-commerce orders without userId remain accessible
   - Product catalog API remains public

3. **Environment Variables**
   - JWT_SECRET: Secret key for signing tokens
   - CRYPTO_SECRET: Key for email encryption
   - Both must be added to backend/.env

4. **Database Indexes**
   - Add unique index on User.username
   - Add index on Order.userId for query performance

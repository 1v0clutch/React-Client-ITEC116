# Requirements Document

## Introduction

This feature integrates user authentication from the Wheels login system into the Module 6 E-Commerce application. The integration will enable user registration, login, and user-specific order management while maintaining the existing e-commerce functionality. The authentication system will use JWT tokens and bcrypt password hashing, with user data stored in MongoDB.

## Glossary

- **Authentication System**: The mechanism that verifies user identity through username/password credentials
- **JWT (JSON Web Token)**: A secure token format used to maintain user sessions
- **E-Commerce Frontend**: The React-based customer portal for browsing products and managing orders (Module 6)
- **Main Backend**: The Express server running on port 8000 that handles all ERP and e-commerce API requests
- **User**: A registered customer who can place orders in the e-commerce system
- **Protected Route**: An API endpoint or page that requires authentication to access
- **Guest User**: An unauthenticated visitor who can browse products but cannot complete purchases

## Requirements

### Requirement 1

**User Story:** As a new customer, I want to register an account with my personal information, so that I can place orders and track my purchases.

#### Acceptance Criteria

1. WHEN a user submits the registration form with valid data THEN the Authentication System SHALL create a new user account with encrypted credentials
2. WHEN a user attempts to register with an existing username THEN the Authentication System SHALL reject the registration and display an error message
3. WHEN a user attempts to register with an existing email THEN the Authentication System SHALL reject the registration and display an error message
4. WHEN a user provides a password shorter than 6 characters THEN the Authentication System SHALL reject the registration and display a validation error
5. WHEN a user provides mismatched password and confirm password fields THEN the Authentication System SHALL reject the registration and display an error message

### Requirement 2

**User Story:** As a registered customer, I want to log into my account, so that I can access my orders and complete purchases.

#### Acceptance Criteria

1. WHEN a user submits valid login credentials THEN the Authentication System SHALL generate a JWT token and return user information
2. WHEN a user submits invalid credentials THEN the Authentication System SHALL reject the login and display an error message
3. WHEN a user successfully logs in THEN the E-Commerce Frontend SHALL store the JWT token in browser local storage
4. WHEN a user successfully logs in THEN the E-Commerce Frontend SHALL display the user's name in the header
5. WHEN a user logs out THEN the E-Commerce Frontend SHALL remove the JWT token from local storage and redirect to the home page

### Requirement 3

**User Story:** As a guest user, I want to browse products and add items to my cart without logging in, so that I can explore the store before committing to registration.

#### Acceptance Criteria

1. WHEN a guest user visits the product catalog THEN the E-Commerce Frontend SHALL display all products without requiring authentication
2. WHEN a guest user adds items to the cart THEN the E-Commerce Frontend SHALL store cart data in local storage without requiring authentication
3. WHEN a guest user views the shopping cart THEN the E-Commerce Frontend SHALL display cart contents without requiring authentication
4. WHEN a guest user attempts to access the checkout page THEN the E-Commerce Frontend SHALL redirect to the login page
5. WHEN a user logs in after adding items to cart THEN the E-Commerce Frontend SHALL preserve the cart contents

### Requirement 4

**User Story:** As a logged-in customer, I want to complete the checkout process, so that I can place orders for the items in my cart.

#### Acceptance Criteria

1. WHEN an authenticated user accesses the checkout page THEN the E-Commerce Frontend SHALL display the checkout form with cart items
2. WHEN an authenticated user submits a valid order THEN the Main Backend SHALL create an order record associated with the user's ID
3. WHEN an authenticated user submits an order THEN the Main Backend SHALL include the user's information in the order data
4. WHEN an unauthenticated user attempts to access checkout THEN the E-Commerce Frontend SHALL redirect to the login page
5. WHEN an order is successfully placed THEN the E-Commerce Frontend SHALL clear the shopping cart

### Requirement 5

**User Story:** As a logged-in customer, I want to view my order history, so that I can track my past purchases and order status.

#### Acceptance Criteria

1. WHEN an authenticated user accesses the orders page THEN the Main Backend SHALL return only orders belonging to that user
2. WHEN an unauthenticated user attempts to access the orders page THEN the E-Commerce Frontend SHALL redirect to the login page
3. WHEN the orders page loads THEN the E-Commerce Frontend SHALL display all orders for the authenticated user
4. WHEN no orders exist for a user THEN the E-Commerce Frontend SHALL display a message indicating no orders found
5. WHEN an order is displayed THEN the E-Commerce Frontend SHALL show order number, date, items, total amount, and status

### Requirement 6

**User Story:** As a system administrator, I want user passwords to be securely hashed and emails to be encrypted, so that customer data is protected.

#### Acceptance Criteria

1. WHEN a user registers THEN the Authentication System SHALL hash the password using bcrypt with a salt rounds value of 12
2. WHEN a user registers THEN the Authentication System SHALL encrypt the email address before storing in the database
3. WHEN a user logs in THEN the Authentication System SHALL compare the provided password with the stored hash using bcrypt
4. WHEN user data is retrieved THEN the Authentication System SHALL decrypt the email address before returning to the client
5. THE Authentication System SHALL never store or transmit passwords in plain text

### Requirement 7

**User Story:** As a developer, I want the authentication system integrated into the main backend, so that the application has a single unified API server.

#### Acceptance Criteria

1. WHEN the Main Backend starts THEN the Authentication System SHALL register authentication routes at the path prefix /api/auth
2. WHEN authentication routes are called THEN the Main Backend SHALL process requests using the User model and authentication controllers
3. THE Main Backend SHALL run on port 8000 and handle both authentication and e-commerce requests
4. THE Main Backend SHALL maintain the existing e-commerce routes without modification
5. THE Main Backend SHALL use the same MongoDB connection for both authentication and e-commerce data

### Requirement 8

**User Story:** As a logged-in customer, I want my session to persist across page refreshes, so that I don't have to log in repeatedly during my shopping session.

#### Acceptance Criteria

1. WHEN a user logs in THEN the E-Commerce Frontend SHALL store the JWT token in local storage
2. WHEN the application loads THEN the E-Commerce Frontend SHALL check for a valid JWT token in local storage
3. WHEN a valid token exists THEN the E-Commerce Frontend SHALL restore the user's authenticated state
4. WHEN a token expires THEN the E-Commerce Frontend SHALL treat the user as unauthenticated
5. WHEN a user manually logs out THEN the E-Commerce Frontend SHALL remove the token and clear the authenticated state

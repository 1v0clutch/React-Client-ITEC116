import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import ProductCatalog from "./pages/ProductCatalog";
import ShoppingCart from "./pages/ShoppingCart";
import Checkout from "./pages/Checkout";
import OrderManagement from "./pages/OrderManagement";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [cartCount, setCartCount] = React.useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const count = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    };

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    const interval = setInterval(updateCartCount, 500);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      clearInterval(interval);
    };
  }, [location]);

  React.useEffect(() => {
    // Close mobile menu when route changes
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-[#222e3c] text-white shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-xl md:text-2xl font-bold hover:text-gray-300 flex items-center">
            <span className="text-2xl mr-2">🛒</span>
            <span className="hidden sm:inline">E-Commerce Store</span>
            <span className="sm:hidden">Shop</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-6 items-center">
            <Link
              to="/"
              className={`hover:text-gray-300 transition ${
                location.pathname === "/" ? "font-bold text-white" : "text-gray-400"
              }`}
            >
              Shop
            </Link>
            <Link
              to="/cart"
              className={`hover:text-gray-300 transition relative ${
                location.pathname === "/cart" ? "font-bold text-white" : "text-gray-400"
              }`}
            >
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              to="/orders"
              className={`hover:text-gray-300 transition ${
                location.pathname === "/orders" ? "font-bold text-white" : "text-gray-400"
              }`}
            >
              My Orders
            </Link>
            
            {/* Authentication UI */}
            {isAuthenticated() ? (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-600">
                <span className="text-gray-300 text-sm">
                  <span className="font-semibold text-white">{user?.fullName || user?.username}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-600">
                <Link
                  to="/login"
                  className={`hover:text-gray-300 transition ${
                    location.pathname === "/login" ? "font-bold text-white" : "text-gray-400"
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-[#36454F] hover:bg-[#818589] px-4 py-2 rounded-md transition text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Cart Icon & Menu Button */}
          <div className="flex items-center gap-4 lg:hidden">
            <Link to="/cart" className="relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white focus:outline-none"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-600 pt-4 animate-slideDown">
            <nav className="flex flex-col space-y-3">
              <Link
                to="/"
                className={`px-4 py-2 rounded-md transition ${
                  location.pathname === "/" ? "bg-[#36454F] text-white font-bold" : "text-gray-300 hover:bg-[#36454F]"
                }`}
              >
                🏪 Shop
              </Link>
              <Link
                to="/cart"
                className={`px-4 py-2 rounded-md transition flex items-center justify-between ${
                  location.pathname === "/cart" ? "bg-[#36454F] text-white font-bold" : "text-gray-300 hover:bg-[#36454F]"
                }`}
              >
                <span>🛒 Cart</span>
                {cartCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                to="/orders"
                className={`px-4 py-2 rounded-md transition ${
                  location.pathname === "/orders" ? "bg-[#36454F] text-white font-bold" : "text-gray-300 hover:bg-[#36454F]"
                }`}
              >
                📦 My Orders
              </Link>
              
              <div className="border-t border-gray-600 pt-3 mt-3">
                {isAuthenticated() ? (
                  <>
                    <div className="px-4 py-2 text-gray-300 text-sm">
                      Welcome, <span className="font-semibold text-white">{user?.fullName || user?.username}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition text-white font-medium"
                    >
                      🚪 Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className={`block px-4 py-2 rounded-md transition ${
                        location.pathname === "/login" ? "bg-[#36454F] text-white font-bold" : "text-gray-300 hover:bg-[#36454F]"
                      }`}
                    >
                      🔑 Login
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-2 rounded-md bg-[#36454F] hover:bg-[#818589] transition text-white font-medium mt-2"
                    >
                      ✨ Register
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-[#1a2230] text-white mt-auto">
      <div className="container mx-auto px-4 py-6 text-center">
        <p>&copy; 2025 E-Commerce Store. All rights reserved.</p>
        <p className="text-sm text-gray-400 mt-2">
          Module 6 - Customer Portal
        </p>
      </div>
    </footer>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<ProductCatalog />} />
              <Route path="/cart" element={<ShoppingCart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <OrderManagement />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

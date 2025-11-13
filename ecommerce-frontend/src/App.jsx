import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import ProductCatalog from "./pages/ProductCatalog";
import ShoppingCart from "./pages/ShoppingCart";
import Checkout from "./pages/Checkout";
import OrderManagement from "./pages/OrderManagement";

function Header() {
  const location = useLocation();
  const [cartCount, setCartCount] = React.useState(0);

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

  return (
    <header className="bg-[#222e3c] text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold hover:text-gray-300">
            🛒 E-Commerce Store
          </Link>
          
          <nav className="flex gap-6 items-center">
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
          </nav>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-[#1a2230] text-white mt-auto">
      <div className="container mx-auto px-4 py-6 text-center">
        <p>&copy; 2024 E-Commerce Store. All rights reserved.</p>
        <p className="text-sm text-gray-400 mt-2">
          Module 6 - Customer Portal
        </p>
      </div>
    </footer>
  );
}

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<ProductCatalog />} />
            <Route path="/cart" element={<ShoppingCart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<OrderManagement />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";

const API_BASE = "http://localhost:8000/api";

function Checkout() {
  const { user, getAuthHeader } = useAuth();
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Philippines",
  });
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
    // Pre-fill user information from logged-in account
    if (user) {
      setCustomerInfo({
        name: user.fullName || user.username || "",
        email: user.email || "",
        phone: "",
      });
    }
  }, [user]);

  const loadCart = () => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      navigate("/cart");
    }
  };

  const validateForm = () => {
    if (!customerInfo.name.trim()) {
      setToast({ message: "Please enter your name", type: "error" });
      return false;
    }
    if (!customerInfo.email.trim()) {
      setToast({ message: "Please enter your email", type: "error" });
      return false;
    }
    if (!customerInfo.phone.trim()) {
      setToast({ message: "Please enter your phone number", type: "error" });
      return false;
    }
    if (!shippingAddress.street.trim()) {
      setToast({ message: "Please enter your street address", type: "error" });
      return false;
    }
    if (!shippingAddress.city.trim()) {
      setToast({ message: "Please enter your city", type: "error" });
      return false;
    }
    if (!shippingAddress.state.trim()) {
      setToast({ message: "Please enter your state/province", type: "error" });
      return false;
    }
    if (!shippingAddress.zipCode.trim()) {
      setToast({ message: "Please enter your zip code", type: "error" });
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      setToast({
        message: "Your cart is empty",
        type: "warning"
      });
      return;
    }

    if (!validateForm()) {
      return;
    }
    
    setProcessing(true);
    
    try {
      // First, create or get customer profile
      const customerData = {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address: shippingAddress,
      };

      const customerResponse = await fetch(`${API_BASE}/ecommerce/customers/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });

      if (!customerResponse.ok) {
        throw new Error("Failed to create customer profile");
      }

      const customerResult = await customerResponse.json();
      const customerId = customerResult.customer._id;
      
      // Prepare order data
      const orderData = {
        customerId: customerId,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: shippingAddress,
      };
      
      // Create order with authentication header (CRITICAL WRITE - will deduct inventory)
      const response = await fetch(`${API_BASE}/ecommerce/orders/create`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...getAuthHeader()
        },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        // Handle authentication errors specifically
        if (response.status === 401) {
          setToast({
            message: "Authentication required. Please log in again.",
            type: "error",
            duration: 5000
          });
          setTimeout(() => {
            navigate("/login");
          }, 2000);
          return;
        }
        throw new Error(error.error || "Failed to create order");
      }
      
      const result = await response.json();
      
      // Clear cart
      localStorage.removeItem("cart");
      
      setToast({
        message: `✓ Order placed successfully! Order #${result.order.orderNumber}`,
        type: "success",
        duration: 5000
      });
      
      setTimeout(() => {
        navigate("/orders");
      }, 2500);
    } catch (error) {
      console.error("Error placing order:", error);
      setToast({
        message: `Failed to place order: ${error.message}`,
        type: "error",
        duration: 5000
      });
    } finally {
      setProcessing(false);
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.12; // 12% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  return (
    <div className="p-5">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={toast.duration || 3000}
        />
      )}
      <h1 className="text-2xl font-bold mb-5">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Shipping Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-[#36454F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Contact Information
          </h2>
          
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#36454F] focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#36454F] focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setCustomerInfo({ ...customerInfo, phone: value });
                }}
                maxLength="11"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#36454F] focus:border-transparent"
                placeholder="09171234567"
              />
            </div>
          </div>

          <h2 className="text-xl font-semibold mt-8 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-[#36454F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Shipping Address
          </h2>

          <div className="space-y-4">
            {/* Street */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={shippingAddress.street}
                onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#36454F] focus:border-transparent"
                placeholder="123 Main Street, Apt 4B"
              />
            </div>

            {/* City and State */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#36454F] focus:border-transparent"
                  placeholder="Manila"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#36454F] focus:border-transparent"
                  placeholder="Metro Manila"
                />
              </div>
            </div>

            {/* Zip Code and Country */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zip Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={shippingAddress.zipCode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#36454F] focus:border-transparent"
                  placeholder="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={shippingAddress.country}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#36454F] focus:border-transparent"
                  placeholder="Philippines"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          
          <div className="mb-4">
            {cart.map((item) => (
              <div key={item.productId} className="flex justify-between py-2 border-b">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold">₱{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4 mb-4">
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>₱{calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm text-gray-600">
              <span>Tax (12%):</span>
              <span>₱{calculateTax().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold border-t pt-2">
              <span>Total:</span>
              <span className="text-green-600">₱{calculateTotal().toFixed(2)}</span>
            </div>
          </div>
          
          <button
            onClick={handlePlaceOrder}
            disabled={processing}
            className={`w-full py-4 rounded-lg text-white font-semibold text-lg transition-all ${
              processing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#10b981] hover:bg-[#059669] shadow-lg hover:shadow-xl"
            }`}
          >
            {processing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Order...
              </span>
            ) : (
              "Place Order"
            )}
          </button>
          
          <p className="text-xs text-gray-500 mt-3 text-center">
            * Inventory will be automatically deducted upon order placement
          </p>
        </div>
      </div>
    </div>
  );
}

export default Checkout;

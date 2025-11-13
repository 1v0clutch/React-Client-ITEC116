import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../../components/Toast";

const API_BASE = "http://localhost:8000/api";

function Checkout() {
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [toast, setToast] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
    fetchCustomers();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      navigate("/ecommerce/cart");
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_BASE}/ecommerce/customers/all`);
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleCreateCustomer = async () => {
    try {
      const response = await fetch(`${API_BASE}/ecommerce/customers/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create customer");
      }
      
      const customer = await response.json();
      setCustomers([...customers, customer.customer]);
      setSelectedCustomer(customer.customer._id);
      setShowNewCustomerForm(false);
      setToast({
        message: "Customer created successfully!",
        type: "success"
      });
    } catch (error) {
      console.error("Error creating customer:", error);
      setToast({
        message: "Failed to create customer",
        type: "error"
      });
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedCustomer) {
      setToast({
        message: "Please select or create a customer",
        type: "warning"
      });
      return;
    }
    
    if (cart.length === 0) {
      setToast({
        message: "Your cart is empty",
        type: "warning"
      });
      return;
    }
    
    setProcessing(true);
    
    try {
      const customer = customers.find(c => c._id === selectedCustomer);
      
      // Prepare order data
      const orderData = {
        customerId: selectedCustomer,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: customer.address,
      };
      
      // Create order (CRITICAL WRITE - will deduct inventory)
      const response = await fetch(`${API_BASE}/ecommerce/orders/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create order");
      }
      
      const result = await response.json();
      
      // Clear cart
      localStorage.removeItem("cart");
      
      setToast({
        message: `Order placed successfully! Order Number: ${result.order.orderNumber}`,
        type: "success",
        duration: 5000
      });
      
      setTimeout(() => {
        navigate("/ecommerce/orders");
      }, 2000);
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

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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
        {/* Customer Selection */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
          
          {!showNewCustomerForm ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Select Customer
                </label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name} ({customer.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={() => setShowNewCustomerForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Create New Customer
              </button>
            </>
          ) : (
            <div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="text"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Street</label>
                <input
                  type="text"
                  value={newCustomer.address.street}
                  onChange={(e) => setNewCustomer({
                    ...newCustomer,
                    address: { ...newCustomer.address, street: e.target.value }
                  })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={newCustomer.address.city}
                    onChange={(e) => setNewCustomer({
                      ...newCustomer,
                      address: { ...newCustomer.address, city: e.target.value }
                    })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <input
                    type="text"
                    value={newCustomer.address.state}
                    onChange={(e) => setNewCustomer({
                      ...newCustomer,
                      address: { ...newCustomer.address, state: e.target.value }
                    })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Zip Code</label>
                  <input
                    type="text"
                    value={newCustomer.address.zipCode}
                    onChange={(e) => setNewCustomer({
                      ...newCustomer,
                      address: { ...newCustomer.address, zipCode: e.target.value }
                    })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <input
                    type="text"
                    value={newCustomer.address.country}
                    onChange={(e) => setNewCustomer({
                      ...newCustomer,
                      address: { ...newCustomer.address, country: e.target.value }
                    })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleCreateCustomer}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Save Customer
                </button>
                <button
                  onClick={() => setShowNewCustomerForm(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
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
                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4 mb-4">
            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span className="text-green-600">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
          
          <button
            onClick={handlePlaceOrder}
            disabled={processing || !selectedCustomer}
            className={`w-full py-3 rounded text-white font-semibold ${
              processing || !selectedCustomer
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {processing ? "Processing Order..." : "Place Order"}
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

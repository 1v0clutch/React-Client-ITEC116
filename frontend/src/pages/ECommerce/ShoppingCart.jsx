import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../../components/Toast";

const API_BASE = "http://localhost:8000/api";

function ShoppingCart() {
  const [cart, setCart] = useState([]);
  const [validating, setValidating] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    // Validate stock availability (CRITICAL READ)
    try {
      const response = await fetch(`${API_BASE}/ecommerce/products/${productId}`);
      const product = await response.json();
      
      if (product.quantity < newQuantity) {
        setToast({
          message: `Insufficient stock! Only ${product.quantity} available.`,
          type: "error"
        });
        return;
      }
      
      const updatedCart = cart.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity, availableStock: product.quantity }
          : item
      );
      
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    } catch (error) {
      console.error("Error updating quantity:", error);
      setToast({
        message: "Failed to update quantity",
        type: "error"
      });
    }
  };

  const removeItem = (productId) => {
    const updatedCart = cart.filter(item => item.productId !== productId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const validateAndProceed = async () => {
    if (cart.length === 0) {
      setToast({
        message: "Your cart is empty",
        type: "warning"
      });
      return;
    }
    
    setValidating(true);
    
    try {
      // Validate all items stock availability (CRITICAL READ)
      const items = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
      
      const response = await fetch(`${API_BASE}/ecommerce/products/validate-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      
      const validation = await response.json();
      
      if (!validation.valid) {
        const errors = validation.results
          .filter(r => !r.available)
          .map(r => r.reason)
          .join(", ");
        
        setToast({
          message: `Stock validation failed: ${errors}`,
          type: "error"
        });
        
        // Refresh cart with current stock levels
        fetchProducts();
        return;
      }
      
      // Proceed to checkout
      navigate("/ecommerce/checkout");
    } catch (error) {
      console.error("Error validating stock:", error);
      setToast({
        message: "Failed to validate stock availability",
        type: "error"
      });
    } finally {
      setValidating(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const updatedCart = await Promise.all(
        cart.map(async (item) => {
          const response = await fetch(`${API_BASE}/ecommerce/products/${item.productId}`);
          const product = await response.json();
          return {
            ...item,
            availableStock: product.quantity,
          };
        })
      );
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    } catch (error) {
      console.error("Error refreshing cart:", error);
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
        />
      )}
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
        <button
          onClick={() => navigate("/ecommerce/catalog")}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Continue Shopping
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate("/ecommerce/catalog")}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden mb-5">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-center">Price</th>
                  <th className="px-4 py-3 text-center">Quantity</th>
                  <th className="px-4 py-3 text-center">Available Stock</th>
                  <th className="px-4 py-3 text-center">Subtotal</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.productId} className="border-t">
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3 text-center">₱{item.price}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="bg-gray-300 px-2 py-1 rounded hover:bg-gray-400"
                        >
                          -
                        </button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="bg-gray-300 px-2 py-1 rounded hover:bg-gray-400"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={item.availableStock < item.quantity ? "text-red-600 font-bold" : ""}>
                        {item.availableStock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">
                      ₱{(item.price * item.quantity).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="bg-white rounded-lg shadow p-5 w-96">
              <div className="flex justify-between mb-3">
                <span className="font-semibold">Total:</span>
                <span className="text-2xl font-bold text-green-600">
                  ₱{calculateTotal().toFixed(2)}
                </span>
              </div>
              <button
                onClick={validateAndProceed}
                disabled={validating}
                className={`w-full py-3 rounded text-white font-semibold ${
                  validating
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {validating ? "Validating Stock..." : "Proceed to Checkout"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ShoppingCart;

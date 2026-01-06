import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../../components/Toast";

const API_BASE = "http://localhost:8000/api";

function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    loadCart();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/ecommerce/products/all`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const addToCart = async (product) => {
    // Check real-time stock availability (CRITICAL READ)
    try {
      const response = await fetch(`${API_BASE}/ecommerce/products/${product._id}`);
      const currentProduct = await response.json();
      
      const existingItem = cart.find(item => item.productId === product._id);
      const requestedQuantity = existingItem ? existingItem.quantity + 1 : 1;
      
      if (currentProduct.quantity < requestedQuantity) {
        setToast({
          message: `Insufficient stock! Only ${currentProduct.quantity} available.`,
          type: "error"
        });
        return;
      }
      
      const updatedCart = [...cart];
      const itemIndex = updatedCart.findIndex(item => item.productId === product._id);
      
      if (itemIndex > -1) {
        updatedCart[itemIndex].quantity += 1;
      } else {
        updatedCart.push({
          productId: product._id,
          name: product.name,
          quantity: 1,
          price: product.quantity, // Using quantity as price for demo
          availableStock: currentProduct.quantity,
        });
      }
      
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      setToast({
        message: `${product.name} added to cart!`,
        type: "success"
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      setToast({
        message: "Failed to add item to cart",
        type: "error"
      });
    }
  };

  const viewCart = () => {
    navigate("/ecommerce/cart");
  };

  if (loading) {
    return <div className="p-5">Loading products...</div>;
  }

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
        <h1 className="text-2xl font-bold">E-Commerce Product Catalog</h1>
        <button
          onClick={viewCart}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          View Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No products available
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <div
              key={product._id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition"
            >
              <div className="mb-3">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.sku}</p>
              </div>
              
              <div className="mb-3">
                <p className="text-sm text-gray-700">{product.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Category: {product.category || "N/A"}
                </p>
              </div>
              
              <div className="mb-3">
                <p className="text-lg font-bold text-green-600">
                  ₱{product.quantity} {/* Using quantity as price for demo */}
                </p>
                <p className={`text-sm ${product.quantity > 10 ? "text-green-600" : "text-orange-600"}`}>
                  Stock: {product.quantity} {product.unit}
                </p>
              </div>
              
              <button
                onClick={() => addToCart(product)}
                disabled={product.quantity === 0}
                className={`w-full py-2 rounded ${
                  product.quantity === 0
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductCatalog;

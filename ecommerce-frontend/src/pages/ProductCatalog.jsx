import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

const API_BASE = "http://localhost:8000/api";

function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
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
      setAllProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = ["all", ...new Set(allProducts.map(p => p.category).filter(Boolean))];

  // Filter products
  const getFilteredProducts = () => {
    let filtered = allProducts;

    // Filter by search
    if (searchQuery.trim()) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    // Filter by stock level
    if (stockFilter === "in-stock") {
      filtered = filtered.filter(p => p.quantity >= 10);
    } else if (stockFilter === "low") {
      filtered = filtered.filter(p => p.quantity > 0 && p.quantity < 10);
    } else if (stockFilter === "out") {
      filtered = filtered.filter(p => p.quantity === 0);
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

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
          price: product.price || 0,
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
    navigate("/cart");
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
      
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Product Catalog</h1>
        <button
          onClick={viewCart}
          className="bg-[#36454F] text-white px-4 py-2 rounded hover:bg-[#818589]"
        >
          🛒 Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Products
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, SKU..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Status
            </label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Products</option>
              <option value="in-stock">In Stock (10+)</option>
              <option value="low">Low Stock (1-9)</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredProducts.length} of {allProducts.length} products
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          {searchQuery || categoryFilter !== "all" || stockFilter !== "all" 
            ? "No products match your filters" 
            : "No products available"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition bg-white"
            >
              {/* Product Image - Improved Size */}
              <div className="relative h-40 bg-gray-100 overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl.startsWith('/uploads/') 
                      ? `http://localhost:8000${product.imageUrl}`
                      : product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs">No Image</p>
                    </div>
                  </div>
                )}
                {product.quantity === 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-lg font-semibold text-sm">
                      Out of Stock
                    </span>
                  </div>
                )}
                {/* Stock Badge */}
                {product.quantity > 0 && product.quantity < 10 && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      Low Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info - More Compact */}
              <div className="p-3">
                <div className="mb-2">
                  <h3 className="text-base font-semibold text-gray-800 line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-gray-500">{product.sku}</p>
                </div>
                
                <div className="mb-2">
                  <p className="text-xs text-gray-600 line-clamp-2 h-8">{product.description || "No description available"}</p>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {product.category || "Uncategorized"}
                  </span>
                  <span className={`text-xs font-medium ${product.quantity > 10 ? "text-green-600" : product.quantity > 0 ? "text-orange-600" : "text-red-600"}`}>
                    {product.quantity} {product.unit} left
                  </span>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <p className="text-lg font-bold text-green-600">
                    ${product.price ? product.price.toFixed(2) : "0.00"}
                  </p>
                </div>
                
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.quantity === 0}
                  className={`w-full py-2 rounded text-sm font-medium ${
                    product.quantity === 0
                      ? "bg-gray-300 cursor-not-allowed text-gray-600"
                      : "bg-[#36454F] text-white hover:bg-[#818589]"
                  }`}
                >
                  {product.quantity === 0 ? "Out of Stock" : "🛒 Add to Cart"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductCatalog;

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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
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

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeProductModal = () => {
    setShowModal(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  const addToCartFromModal = async () => {
    if (selectedProduct) {
      await addToCart(selectedProduct);
      closeProductModal();
    }
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-5">
        <h1 className="text-2xl md:text-3xl font-bold">Product Catalog</h1>
        <button
          onClick={viewCart}
          className="bg-[#36454F] text-white px-4 py-2 rounded hover:bg-[#818589] transition-colors w-full sm:w-auto"
        >
          🛒 Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              onClick={() => openProductModal(product)}
              className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition bg-white cursor-pointer transform hover:scale-105 duration-200"
            >
              {/* Product Image - Improved Size */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
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
                    ₱{product.price ? product.price.toFixed(2) : "0.00"}
                  </p>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product);
                  }}
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

      {/* Product Detail Modal */}
      {showModal && selectedProduct && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={closeProductModal}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
              <button
                onClick={closeProductModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="relative">
                  <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                    {selectedProduct.imageUrl ? (
                      <img
                        src={selectedProduct.imageUrl.startsWith('/uploads/') 
                          ? `http://localhost:8000${selectedProduct.imageUrl}`
                          : selectedProduct.imageUrl}
                        alt={selectedProduct.name}
                        className="w-full h-full object-contain p-4"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f8fafc' stroke='%23e2e8f0' stroke-width='2'/%3E%3Cg transform='translate(150,100)'%3E%3Ccircle cx='0' cy='-20' r='25' fill='%23cbd5e1'/%3E%3Cpath d='M-15,10 L15,10 L10,25 L-10,25 Z' fill='%23cbd5e1'/%3E%3Ccircle cx='-8' cy='-25' r='3' fill='%23ffffff'/%3E%3C/g%3E%3Ctext x='50%25' y='75%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='14' fill='%236b7280'%3EImage not available%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <svg className="w-24 h-24 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm">No Image Available</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Stock Badge */}
                  {selectedProduct.quantity === 0 && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  {selectedProduct.quantity > 0 && selectedProduct.quantity < 10 && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg">
                        Low Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col">
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">SKU: {selectedProduct.sku}</p>
                    
                    <div className="mb-6">
                      <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                        {selectedProduct.category || "Uncategorized"}
                      </span>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                      <p className="text-gray-600 leading-relaxed">
                        {selectedProduct.description || "No description available for this product."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Price</p>
                        <p className="text-2xl font-bold text-green-600">
                          ₱{selectedProduct.price ? selectedProduct.price.toFixed(2) : "0.00"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Availability</p>
                        <p className={`text-lg font-semibold ${
                          selectedProduct.quantity > 10 ? "text-green-600" : 
                          selectedProduct.quantity > 0 ? "text-orange-600" : "text-red-600"
                        }`}>
                          {selectedProduct.quantity} {selectedProduct.unit} left
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={closeProductModal}
                      className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors order-2 sm:order-1"
                    >
                      Close
                    </button>
                    <button
                      onClick={addToCartFromModal}
                      disabled={selectedProduct.quantity === 0}
                      className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors order-1 sm:order-2 ${
                        selectedProduct.quantity === 0
                          ? "bg-gray-300 cursor-not-allowed text-gray-600"
                          : "bg-[#36454F] text-white hover:bg-[#818589]"
                      }`}
                    >
                      {selectedProduct.quantity === 0 ? "Out of Stock" : "🛒 Add to Cart"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductCatalog;

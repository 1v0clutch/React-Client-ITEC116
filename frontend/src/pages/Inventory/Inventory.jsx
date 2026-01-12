import React, { useState, useEffect } from "react";
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  X,
  CheckCircle,
  AlertCircle,
  Filter,
} from "lucide-react";
import InventoryModal from "../../components/modals/InventoryModal";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    name: "",
    sku: "",
    description: "",
    category: "",
    quantity: 0,
    price: 0,
    imageUrl: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchId, setSearchId] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [allItems, setAllItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [skuFilter, setSkuFilter] = useState("");

  const API_INVENTORY = "http://localhost:8000/api/inventory";

  useEffect(() => {
    fetchAllItems();
  }, []);

  // Generate unique SKU automatically
  const generateSKU = (name, category) => {
    if (!name || !category) return "";
    
    // Create base SKU from name and category
    const namePrefix = name.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const categoryPrefix = category.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Generate random suffix to ensure uniqueness
    const timestamp = Date.now().toString().slice(-4);
    const randomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    
    return `${namePrefix}${categoryPrefix}-${timestamp}${randomSuffix}`;
  };

  const fetchAllItems = async () => {
    try {
      const response = await fetch(`${API_INVENTORY}/getItems`);
      const data = await response.json();
      if (response.ok) {
        setItems(data);
        setAllItems(data);
      } else {
        setMessage({
          text: data.error || "Failed to fetch items",
          type: "error",
        });
      }
    } catch (error) {
      setMessage({
        text: `Error fetching items: ${error.message}`,
        type: "error",
      });
    }
  };

  const addItem = async () => {
    try {
      // Generate SKU if not provided
      let itemToAdd = { ...currentItem };
      if (!itemToAdd.sku && itemToAdd.name && itemToAdd.category) {
        itemToAdd.sku = generateSKU(itemToAdd.name, itemToAdd.category);
      }

      const response = await fetch(`${API_INVENTORY}/addItem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemToAdd),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({
          text: data.message || "Item added successfully",
          type: "success",
        });
        resetForm();
        fetchAllItems();
      } else {
        setMessage({ text: data.error || "Failed to add item", type: "error" });
      }
    } catch (error) {
      setMessage({
        text: `Error adding item: ${error.message}`,
        type: "error",
      });
    }
  };

  const updateItem = async () => {
    try {
      const response = await fetch(`${API_INVENTORY}/updateItem/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentItem),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({
          text: data.message || "Item updated successfully",
          type: "success",
        });
        resetForm();
        fetchAllItems();
      } else {
        setMessage({
          text: data.error || "Failed to update item",
          type: "error",
        });
      }
    } catch (error) {
      setMessage({
        text: `Error updating item: ${error.message}`,
        type: "error",
      });
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this item? This action cannot be undone and will remove the item completely from the system, including any warehouse assignments.")) return;

    try {
      const response = await fetch(`${API_INVENTORY}/deleteItem/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (response.ok) {
        // Also clean up warehouse assignments for this item
        try {
          await fetch(`http://localhost:8000/api/warehouses/removeItemFromAllWarehouses/${id}`, {
            method: "DELETE",
          });
        } catch (warehouseError) {
          console.warn("Failed to clean up warehouse assignments:", warehouseError);
        }

        setMessage({
          text: data.message || "Item permanently deleted from inventory and all warehouses",
          type: "success",
        });
        // Remove item from local state immediately for better UX
        setAllItems(prevItems => prevItems.filter(item => item._id !== id));
        setItems(prevItems => prevItems.filter(item => item._id !== id));
      } else {
        setMessage({
          text: data.error || "Failed to delete item",
          type: "error",
        });
      }
    } catch (error) {
      setMessage({
        text: `Error deleting item: ${error.message}`,
        type: "error",
      });
    }
  };

  const searchItemById = async () => {
    if (!searchId.trim()) {
      fetchAllItems();
      return;
    }

    const foundItem = allItems.find((item) =>
      item.name.toLowerCase().includes(searchId.toLowerCase())
    );

    if (!foundItem) {
      setMessage({
        text: `No item found with name "${searchId}"`,
        type: "error",
      });
      setItems([]);
      return;
    }

    try {
      const response = await fetch(`${API_INVENTORY}/getItem/${foundItem._id}`);
      const data = await response.json();

      if (response.ok) {
        setItems([data]);
        setMessage({ text: "Search successful", type: "success" });
      } else {
        setMessage({
          text: data.error || "Failed to search item",
          type: "error",
        });
        setItems([]);
      }
    } catch (error) {
      setMessage({
        text: `Error searching item: ${error.message}`,
        type: "error",
      });
    }
  };

  const resetForm = () => {
    setCurrentItem({
      name: "",
      sku: "",
      description: "",
      category: "",
      quantity: 0,
      price: 0,
      imageUrl: "",
    });
    setIsEditing(false);
    setEditingId(null);
    setShowModal(false);
  };

  const openAddModal = () => {
    resetForm();
    // Don't auto-generate SKU - let user click Generate button
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setCurrentItem({
      name: item.name,
      sku: item.sku,
      description: item.description || "",
      category: item.category,
      quantity: item.quantity,
      price: item.price || 0,
      imageUrl: item.imageUrl || "",
    });
    setIsEditing(true);
    setEditingId(item._id);
    setShowModal(true);
  };

  const handleModalSubmit = () => {
    if (isEditing) {
      updateItem();
    } else {
      addItem();
    }
  };

  // Get unique categories
  const categories = ["all", ...new Set(allItems.map(item => item.category))];

  // Enhanced filtering function with multiple criteria
  const getFilteredItems = () => {
    let filtered = searchId.trim() ? items : allItems;

    // Filter by name (if nameFilter is set)
    if (nameFilter.trim()) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    // Filter by SKU (if skuFilter is set)
    if (skuFilter.trim()) {
      filtered = filtered.filter(item => 
        item.sku.toLowerCase().includes(skuFilter.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Filter by stock level
    if (stockFilter === "low") {
      filtered = filtered.filter(item => item.quantity < 10);
    } else if (stockFilter === "out") {
      filtered = filtered.filter(item => item.quantity === 0);
    } else if (stockFilter === "in-stock") {
      filtered = filtered.filter(item => item.quantity >= 10);
    }

    return filtered;
  };

  // Clear all filters function
  const clearAllFilters = () => {
    setCategoryFilter("all");
    setStockFilter("all");
    setNameFilter("");
    setSkuFilter("");
    setSearchId("");
    fetchAllItems();
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Inventory Management</h1>
              <p className="text-white/80 text-sm">Manage Stock Items & Inventory</p>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Item
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center justify-between ${
            message.type === "success"
              ? "bg-green-100 border border-green-300 text-green-800"
              : "bg-red-100 border border-red-300 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage({ text: "", type: "" })}
            className="hover:opacity-70 transition-opacity"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Enhanced Search and Filter Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-2 border-gray-100 hover:border-indigo-200 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-2 shadow-lg">
              <Search className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Search & Filter</h3>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative group">
            <input
              type="text"
              placeholder="Search by item name..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 group-hover:border-blue-300 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>
          <button
            onClick={searchItemById}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
          <button
            onClick={() => {
              setSearchId("");
              fetchAllItems();
            }}
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Show All
          </button>
        </div>

        {/* Advanced Filters - Collapsible */}
        {showFilters && (
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border-2 border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-indigo-500" />
              <span className="text-lg font-semibold text-gray-700">Advanced Filters</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Name Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Name:</label>
                <input
                  type="text"
                  placeholder="Enter item name..."
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
                />
              </div>

              {/* SKU Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by SKU:</label>
                <input
                  type="text"
                  placeholder="Enter SKU..."
                  value={skuFilter}
                  onChange={(e) => setSkuFilter(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category:</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Level:</label>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
                >
                  <option value="all">All Items</option>
                  <option value="in-stock">In Stock (≥10)</option>
                  <option value="low">Low Stock (&lt;10)</option>
                  <option value="out">Out of Stock (0)</option>
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {filteredItems.length} of {allItems.length} items
              </div>
              
              {(categoryFilter !== "all" || stockFilter !== "all" || nameFilter.trim() || skuFilter.trim()) && (
                <button
                  onClick={clearAllFilters}
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Items List */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Stock Items</h3>
              <p className="text-white/80 text-sm">{filteredItems.length} items found</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-500">No items found</p>
              <p className="text-gray-400 mt-2">Add your first inventory item above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">SKU</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Category</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-700">Quantity</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="py-4 px-4 font-medium text-gray-800">{item.name}</td>
                      <td className="py-4 px-4 text-gray-600">{item.sku}</td>
                      <td className="py-4 px-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`font-semibold px-3 py-1 rounded-full text-sm ${
                            item.quantity === 0
                              ? "bg-red-100 text-red-800"
                              : item.quantity < 10
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.quantity}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => openEditModal(item)}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteItem(item._id)}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              (window.location.href = `/inventory/transactions`)
                            }
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                            title="View Transactions"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Component */}
      <InventoryModal
        isOpen={showModal}
        onClose={resetForm}
        isEditing={isEditing}
        currentItem={currentItem}
        setCurrentItem={setCurrentItem}
        onSubmit={handleModalSubmit}
        allItems={allItems}
      />
    </div>
  );
};

export default Inventory;
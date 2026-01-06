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

  const API_INVENTORY = "http://localhost:8000/api/inventory";

  useEffect(() => {
    fetchAllItems();
  }, []);

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
      const response = await fetch(`${API_INVENTORY}/addItem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentItem),
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
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`${API_INVENTORY}/deleteItem/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({
          text: data.message || "Item deleted successfully",
          type: "success",
        });
        fetchAllItems();
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
    });
    setIsEditing(false);
    setEditingId(null);
    setShowModal(false);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setCurrentItem({
      name: item.name,
      sku: item.sku,
      description: item.description || "",
      category: item.category,
      quantity: item.quantity,
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

  // Filter items based on search, category, and stock level
  const getFilteredItems = () => {
    let filtered = searchId.trim() ? items : allItems;

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

  const filteredItems = getFilteredItems();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Inventory Management</h1>
          </div>
          <button
            onClick={openAddModal}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors flex items-center gap-2 text-white"
          >
            <Plus className="w-5 h-5" />
            Add Item
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
            message.type === "success"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : "bg-red-500/10 border border-red-500/30 text-red-400"
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

      {/* Search and Filter Section */}
      <div className="mb-6 rounded-xl p-6">
        {/* Search Bar */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by item name..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full border border-slate-600 rounded-lg px-4 py-3 placeholder-slate-500 focus:outline-none"
            />
          </div>
          <button
            onClick={searchItemById}
            className="px-6 py-3 font-medium transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
          <button
            onClick={() => {
              setSearchId("");
              fetchAllItems();
            }}
            className="px-6 py-3 font-medium transition-colors"
          >
            Show All
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm ">Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className=" border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm ">Stock Level:</label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className=" border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none"
            >
              <option value="all">All Items</option>
              <option value="in-stock">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>

          {(categoryFilter !== "all" || stockFilter !== "all") && (
            <button
              onClick={() => {
                setCategoryFilter("all");
                setStockFilter("all");
              }}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Items List */}
      <div className="border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">
            Stock Items ({filteredItems.length})
          </h3>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No items found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-4 px-4  font-medium">
                    Name
                  </th>
                  <th className="text-left py-4 px-4 font-medium">
                    SKU
                  </th>
                  <th className="text-left py-4 px-4 font-medium">
                    Category
                  </th>
                  <th className="text-left py-4 px-4 font-medium">
                    Quantity
                  </th>
                  <th className="text-right py-4 px-4 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-4 px-4 font-medium">{item.name}</td>
                    <td className="py-4 px-4 ">{item.sku}</td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-blue-500/20 rounded-full text-sm">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`font-semibold ${
                          item.quantity === 0
                            ? "text-red-600"
                            : item.quantity < 10
                            ? "text-red-400"
                            : "text-green-400"
                        }`}
                      >
                        {item.quantity}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteItem(item._id)}
                          className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            (window.location.href = `/inventory/transactions`)
                          }
                          className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-white"
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

      {/* Modal Component */}
      <InventoryModal
        isOpen={showModal}
        onClose={resetForm}
        isEditing={isEditing}
        currentItem={currentItem}
        setCurrentItem={setCurrentItem}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};

export default Inventory;
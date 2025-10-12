import React, { useState, useEffect } from "react";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    name: "",
    sku: "",
    description: "",
    category: "",
    quantity: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchId, setSearchId] = useState("");
  const [message, setMessage] = useState("");
  const [allItems, setAllItems] = useState([]);

  const API_INVENTORY = "http://localhost:8000/api/inventory";

  useEffect(() => {
    fetchAllItems();
  }, []);

  // Fetch all items
  const fetchAllItems = async () => {
    try {
      const response = await fetch(`${API_INVENTORY}/getItems`);
      const data = await response.json();
      if (response.ok) {
        setItems(data);
        setAllItems(data);
      } else {
        setMessage(data.error || "Failed to fetch items");
      }
    } catch (error) {
      setMessage(`Error fetching items: ${error.message}`);
    }
  };

  // Add new item
  const addItem = async () => {
    try {
      const response = await fetch(`${API_INVENTORY}/addItem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentItem),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Item added successfully");
        resetForm();
        fetchAllItems();
      } else {
        setMessage(data.error || "Failed to add item");
      }
    } catch (error) {
      setMessage(`Error adding item: ${error.message}`);
    }
  };

  // Update item
  const updateItem = async () => {
    try {
      const response = await fetch(`${API_INVENTORY}/updateItem/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentItem),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Item updated successfully");
        resetForm();
        fetchAllItems();
      } else {
        setMessage(data.error || "Failed to update item");
      }
    } catch (error) {
      setMessage(`Error updating item: ${error.message}`);
    }
  };

  // Delete item
  const deleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`${API_INVENTORY}/deleteItem/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Item deleted successfully");
        fetchAllItems();
      } else {
        setMessage(data.error || "Failed to delete item");
      }
    } catch (error) {
      setMessage(`Error deleting item: ${error.message}`);
    }
  };

  // Search item by name
  const searchItemById = async () => {
    if (!searchId.trim()) {
      fetchAllItems();
      return;
    }

    const foundItem = allItems.find((item) =>
      item.name.toLowerCase().includes(searchId.toLowerCase())
    );

    if (!foundItem) {
      setMessage(`No item found with name "${searchId}"`);
      setItems([]);
      return;
    }

    try {
      const response = await fetch(`${API_INVENTORY}/getItem/${foundItem._id}`);
      const data = await response.json();

      if (response.ok) {
        setItems([data]);
        setMessage("Search successful");
      } else {
        setMessage(data.error || "Failed to search item");
        setItems([]);
      }
    } catch (error) {
      setMessage(`Error searching item: ${error.message}`);
    }
  };

  // Edit item
  const editItem = (item) => {
    setCurrentItem({
      name: item.name,
      sku: item.sku,
      description: item.description || "",
      category: item.category,
      quantity: item.quantity,
    });
    setIsEditing(true);
    setEditingId(item._id);
  };

  // Reset form
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
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Inventory Management System</h1>

      {/* Message Display */}
      {message && (
        <div className="p-2.5 mb-5 bg-[#f0f0f0] border-gray-400 rounded-sm">
          {message}
          <button
            onClick={() => setMessage("")}
            className="float-right bg-none border-none cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Search Section */}
      <div className="mb-8 mt-4 p-4 bg-[#f0f0f0] border">
        <h3>Search Item</h3>
        <input
          type="text"
          placeholder="Enter item name"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="p-2 mr-3 w-[300px] border rounded-2xl outline-none"
        />
        <button
          onClick={searchItemById}
          className="p-2 border rounded-2xl cursor-pointer"
        >
          Search
        </button>
        <button
          onClick={fetchAllItems}
          className="p-2 ml-3 border rounded-2xl cursor-pointer"
        >
          Show All
        </button>
      </div>

      {/* Add/Edit Form */}
      <div className="mb-8 mt-4 p-4 bg-[#f0f0f0] border">
        <h3>{isEditing ? "Edit Item" : "Add New Item"}</h3>
        <div>
          <div className="mb-4 mt-4">
            <label>Name: </label>
            <input
              type="text"
              value={currentItem.name}
              onChange={(e) =>
                setCurrentItem({ ...currentItem, name: e.target.value })
              }
              required
              className="p-1 w-[300px] border rounded-sm outline-none"
            />
          </div>

          <div className="mb-4 mt-4">
            <label>SKU: </label>
            <input
              type="text"
              value={currentItem.sku}
              onChange={(e) =>
                setCurrentItem({ ...currentItem, sku: e.target.value })
              }
              required
              className="p-1 w-[300px] border rounded-sm outline-none"
            />
          </div>

          <div className="mb-4 mt-4">
            <label>Description: </label>
            <textarea
              value={currentItem.description}
              onChange={(e) =>
                setCurrentItem({ ...currentItem, description: e.target.value })
              }
              className="p-1 w-[300px] border rounded-sm outline-none"
            />
          </div>

          <div className="mb-4 mt-4">
            <label>Category: </label>
            <input
              type="text"
              value={currentItem.category}
              onChange={(e) =>
                setCurrentItem({ ...currentItem, category: e.target.value })
              }
              required
              className="p-1 w-[300px] border rounded-sm outline-none"
            />
          </div>

          <div className="mb-4 mt-4">
            <label>Quantity: </label>
            <input
              type="number"
              min="0"
              value={currentItem.quantity}
              onChange={(e) =>
                setCurrentItem({
                  ...currentItem,
                  quantity: parseInt(e.target.value) || 0,
                })
              }
              required
              className="p-1 w-[300px] border rounded-sm outline-none"
            />
          </div>

          <button
            type="button"
            onClick={isEditing ? updateItem : addItem}
            className="p-2 border rounded-2xl cursor-pointer"
          >
            {isEditing ? "Update Item" : "Add Item"}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="p-2 ml-3 border rounded-2xl cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Items List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Items List ({items.length} items)
        </h3>
        {items.length === 0 ? (
          <p className="text-gray-600">No items found.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2.5 border border-gray-300 text-left">Name</th>
                <th className="p-2.5 border border-gray-300 text-left">SKU</th>
                <th className="p-2.5 border border-gray-300 text-left">
                  Category
                </th>
                <th className="p-2.5 border border-gray-300 text-left">
                  Quantity
                </th>
                <th className="p-2.5 border border-gray-300 text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="p-2.5 border border-gray-300">{item.name}</td>
                  <td className="p-2.5 border border-gray-300">{item.sku}</td>
                  <td className="p-2.5 border border-gray-300">
                    {item.category}
                  </td>
                  <td className="p-2.5 border border-gray-300">
                    {item.quantity}
                  </td>
                  <td className="p-2.5 border border-gray-300">
                    <button
                      onClick={() => editItem(item)}
                      className="px-2.5 py-1.5 mr-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteItem(item._id)}
                      className="px-2.5 py-1.5 mr-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => (window.location.href = `/transactions`)}
                      className="px-2.5 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      View Transactions
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Inventory;

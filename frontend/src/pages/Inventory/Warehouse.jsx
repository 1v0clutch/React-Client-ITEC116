import React, { useEffect, useState } from "react";

const Warehouse = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [itemId, setItemId] = useState("");
  const [zone, setZone] = useState("");
  const [fromWarehouse, setFromWarehouse] = useState("");
  const [toWarehouse, setToWarehouse] = useState("");
  const [transferItemId, setTransferItemId] = useState("");
  const [transferQuantity, setTransferQuantity] = useState("");
  const [inventoryItems, setInventoryItems] = useState([]);

  const API_INVENTORY = "http://localhost:8000/api/inventory";
  const API_WAREHOUSE = "http://localhost:8000/api/warehouses";

  const fetchInventoryItems = async () => {
    try {
      const res = await fetch(`${API_INVENTORY}/getItems`);
      if (!res.ok) throw new Error("Failed to fetch inventory items");
      const data = await res.json();
      setInventoryItems(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  // Fetch warehouses
  const fetchWarehouses = async () => {
    try {
      const res = await fetch(`${API_WAREHOUSE}/getAllWarehouse`);
      if (!res.ok) throw new Error("Failed to fetch warehouses");
      const data = await res.json();
      setWarehouses(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchWarehouses();
    fetchInventoryItems();
  }, []);

  // Add warehouse
  const handleAddWarehouse = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_WAREHOUSE}/addWarehouse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, location }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error adding warehouse");
      }

      setName("");
      setLocation("");
      fetchWarehouses();
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete warehouse
  const handleDeleteWarehouse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this warehouse?"))
      return;
    try {
      const res = await fetch(`${API_WAREHOUSE}/deleteWarehouse/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error deleting warehouse");
      }

      fetchWarehouses();
    } catch (err) {
      alert(err.message);
    }
  };

  // Assign item
  const handleAssignItem = async (e) => {
    e.preventDefault();

    // Find the selected item in inventory
    const selectedItem = inventoryItems.find((i) => i._id === itemId);
    if (!selectedItem) {
      alert("Item not found in inventory");
      return;
    }

    try {
      const res = await fetch(`${API_WAREHOUSE}/assignItem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          warehouseId: fromWarehouse,
          itemId,
          quantity: selectedItem.quantity, //
          zone,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error assigning item");
      }

      setItemId("");
      setZone("");
      setFromWarehouse("");
      fetchWarehouses();
    } catch (err) {
      alert(err.message);
    }
  };

  // Transfer item
  const handleTransferItem = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_WAREHOUSE}/transferItem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromWarehouseId: fromWarehouse,
          toWarehouseId: toWarehouse,
          itemId: transferItemId,
          quantity: transferQuantity,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error transferring item");
      }

      setFromWarehouse("");
      setToWarehouse("");
      setTransferItemId("");
      setTransferQuantity("");
      fetchWarehouses();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Warehouse Management</h1>

      {/* Add Warehouse */}
      <form onSubmit={handleAddWarehouse} className="mb-6">
        <h2 className="font-semibold mb-2">Add Warehouse</h2>
        <input
          type="text"
          placeholder="Warehouse Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 mr-2"
          required
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border p-2 mr-2"
          required
        />
        <button type="submit" className="bg-green-600 text-white px-4 py-2">
          Add
        </button>
      </form>

      {/* Assign Item */}
      <form onSubmit={handleAssignItem} className="mb-6">
        <h2 className="font-semibold mb-2">Assign Item to Warehouse</h2>
        <select
          value={fromWarehouse}
          onChange={(e) => setFromWarehouse(e.target.value)}
          className="border p-2 mr-2"
          required
        >
          <option value="">Select Warehouse</option>
          {warehouses.map((w) => (
            <option key={w._id} value={w._id}>
              {w.name}
            </option>
          ))}
        </select>

        {/* Only show inventory items that are NOT already assigned */}
        <select
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          className="border p-2 mr-2"
          required
        >
          <option value="">Select Item</option>
          {inventoryItems
            .filter(
              (item) =>
                !warehouses.some((w) =>
                  w.items.some((wi) => wi.itemId._id === item._id)
                )
            )
            .map((item) => (
              <option key={item._id} value={item._id}>
                {item.name} ({item.sku} - Stock: {item.quantity})
              </option>
            ))}
        </select>

        <input
          type="text"
          placeholder="Zone"
          value={zone}
          onChange={(e) => setZone(e.target.value)}
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2">
          Assign
        </button>
      </form>

      {/* Transfer Item */}
      <form onSubmit={handleTransferItem} className="mb-6">
        <h2 className="font-semibold mb-2">Transfer Item Between Warehouses</h2>

        {/* From warehouse */}
        <select
          value={fromWarehouse}
          onChange={(e) => setFromWarehouse(e.target.value)}
          className="border p-2 mr-2"
          required
        >
          <option value="">From Warehouse</option>
          {warehouses.map((w) => (
            <option key={w._id} value={w._id}>
              {w.name}
            </option>
          ))}
        </select>

        {/* To warehouse */}
        <select
          value={toWarehouse}
          onChange={(e) => setToWarehouse(e.target.value)}
          className="border p-2 mr-2"
          required
        >
          <option value="">To Warehouse</option>
          {warehouses.map((w) => (
            <option key={w._id} value={w._id}>
              {w.name}
            </option>
          ))}
        </select>

        {/* Item dropdown based on selected fromWarehouse */}
        <select
          value={transferItemId}
          onChange={(e) => setTransferItemId(e.target.value)}
          className="border p-2 mr-2"
          required
        >
          <option value="">Select Item</option>
          {warehouses
            .find((w) => w._id === fromWarehouse)
            ?.items.map((i) => (
              <option key={i.itemId._id} value={i.itemId._id}>
                {i.itemId.name} ({i.itemId.sku}) - Qty: {i.quantity}
              </option>
            ))}
        </select>

        <input
          type="number"
          placeholder="Quantity"
          value={transferQuantity}
          onChange={(e) => setTransferQuantity(e.target.value)}
          className="border p-2 mr-2"
          required
        />

        <button type="submit" className="bg-purple-600 text-white px-4 py-2">
          Transfer
        </button>
      </form>

      {/* List Warehouses */}
      <h2 className="font-semibold mb-2">Warehouse List</h2>
      <ul>
        {warehouses.map((w) => (
          <li key={w._id} className="border p-3 mb-2">
            <div className="flex justify-between items-center">
              <span>
                <strong>{w.name}</strong> - {w.location}
              </span>
              <button
                onClick={() => handleDeleteWarehouse(w._id)}
                className="bg-red-600 text-white px-3 py-1"
              >
                Delete
              </button>
            </div>
            {w.items.length > 0 && (
              <ul className="ml-4 mt-2 text-sm">
                {w.items.map((i, idx) => (
                  <li key={idx}>
                    {i.itemId?.name || i.itemId} - Qty: {i.quantity} (Zone:{" "}
                    {i.zone || "N/A"})
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Warehouse;

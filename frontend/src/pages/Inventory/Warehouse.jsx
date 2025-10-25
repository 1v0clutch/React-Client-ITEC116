import React, { useEffect, useState } from "react";
import { Warehouse, Plus, Trash2, Package, MapPin, X, CheckCircle, AlertCircle, ArrowRightLeft } from "lucide-react";
import { AddWarehouseModal, AssignItemModal, TransferItemModal } from "../../components/modals/WarehouseModal";

const WarehouseManagement = () => {
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
  const [message, setMessage] = useState({ text: "", type: "" });
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const API_INVENTORY = "http://localhost:8000/api/inventory";
  const API_WAREHOUSE = "http://localhost:8000/api/warehouses";

  const fetchInventoryItems = async () => {
    try {
      const res = await fetch(`${API_INVENTORY}/getItems`);
      if (!res.ok) throw new Error("Failed to fetch inventory items");
      const data = await res.json();
      setInventoryItems(data);
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await fetch(`${API_WAREHOUSE}/getAllWarehouse`);
      if (!res.ok) throw new Error("Failed to fetch warehouses");
      const data = await res.json();
      setWarehouses(data);
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    }
  };

  useEffect(() => {
    fetchWarehouses();
    fetchInventoryItems();
  }, []);

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

      setMessage({ text: "Warehouse added successfully", type: "success" });
      setName("");
      setLocation("");
      setShowAddModal(false);
      fetchWarehouses();
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    }
  };

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

      setMessage({ text: "Warehouse deleted successfully", type: "success" });
      fetchWarehouses();
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    }
  };

  const handleAssignItem = async (e) => {
    e.preventDefault();

    const selectedItem = inventoryItems.find((i) => i._id === itemId);
    if (!selectedItem) {
      setMessage({ text: "Item not found in inventory", type: "error" });
      return;
    }

    try {
      const res = await fetch(`${API_WAREHOUSE}/assignItem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          warehouseId: fromWarehouse,
          itemId,
          quantity: selectedItem.quantity,
          zone,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error assigning item");
      }

      setMessage({ text: "Item assigned successfully", type: "success" });
      setItemId("");
      setZone("");
      setFromWarehouse("");
      setShowAssignModal(false);
      fetchWarehouses();
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    }
  };

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

      setMessage({ text: "Item transferred successfully", type: "success" });
      setFromWarehouse("");
      setToWarehouse("");
      setTransferItemId("");
      setTransferQuantity("");
      setShowTransferModal(false);
      fetchWarehouses();
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Warehouse className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Warehouse Management</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Warehouse
            </button>
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Package className="w-5 h-5" />
              Assign Item
            </button>
            <button
              onClick={() => setShowTransferModal(true)}
              className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <ArrowRightLeft className="w-5 h-5" />
              Transfer Item
            </button>
          </div>
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

      {/* Warehouse List */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">
            Warehouses ({warehouses.length})
          </h3>
        </div>

        {warehouses.length === 0 ? (
          <div className="text-center py-12">
            <Warehouse className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No warehouses found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {warehouses.map((w) => (
              <div
                key={w._id}
                className="bg-slate-900/50 border border-slate-700 rounded-lg p-5 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Warehouse className="w-5 h-5 text-blue-400" />
                      <h4 className="font-semibold text-lg">{w.name}</h4>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{w.location}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteWarehouse(w._id)}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {w.items.length > 0 ? (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-400">
                        Items ({w.items.length})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {w.items.map((i, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-800/50 rounded-lg p-3 text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {i.itemId?.name || "Unknown Item"}
                            </span>
                            <span className="text-blue-400 font-semibold">
                              Qty: {i.quantity}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-slate-400 text-xs">
                            <span>SKU: {i.itemId?.sku || "N/A"}</span>
                            {i.zone && (
                              <span className="px-2 py-0.5 bg-slate-700 rounded">
                                Zone: {i.zone}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-slate-700 text-center text-slate-500 text-sm">
                    No items assigned
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddWarehouseModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setName("");
          setLocation("");
        }}
        name={name}
        setName={setName}
        location={location}
        setLocation={setLocation}
        onSubmit={handleAddWarehouse}
      />

      <AssignItemModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setFromWarehouse("");
          setItemId("");
          setZone("");
        }}
        warehouses={warehouses}
        inventoryItems={inventoryItems}
        fromWarehouse={fromWarehouse}
        setFromWarehouse={setFromWarehouse}
        itemId={itemId}
        setItemId={setItemId}
        zone={zone}
        setZone={setZone}
        onSubmit={handleAssignItem}
      />

      <TransferItemModal
        isOpen={showTransferModal}
        onClose={() => {
          setShowTransferModal(false);
          setFromWarehouse("");
          setToWarehouse("");
          setTransferItemId("");
          setTransferQuantity("");
        }}
        warehouses={warehouses}
        fromWarehouse={fromWarehouse}
        setFromWarehouse={setFromWarehouse}
        toWarehouse={toWarehouse}
        setToWarehouse={setToWarehouse}
        transferItemId={transferItemId}
        setTransferItemId={setTransferItemId}
        transferQuantity={transferQuantity}
        setTransferQuantity={setTransferQuantity}
        onSubmit={handleTransferItem}
      />
    </div>
  );
};

export default WarehouseManagement;
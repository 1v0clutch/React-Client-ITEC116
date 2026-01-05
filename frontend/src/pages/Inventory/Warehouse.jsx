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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <Warehouse className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Warehouse Management</h1>
              <p className="text-white/80 text-sm">Manage Warehouses & Item Assignments</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Warehouse
            </button>
            <button
              onClick={() => setShowAssignModal(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <Package className="w-5 h-5" />
              Assign Item
            </button>
            <button
              onClick={() => setShowTransferModal(true)}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
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

      {/* Enhanced Warehouse List */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
              <Warehouse className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Warehouses</h3>
              <p className="text-white/80 text-sm">{warehouses.length} active warehouses</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {warehouses.length === 0 ? (
            <div className="text-center py-12">
              <Warehouse className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-500">No warehouses found</p>
              <p className="text-gray-400 mt-2">Add your first warehouse above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {warehouses.map((w) => (
                <div
                  key={w._id}
                  className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 hover:border-blue-300 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Warehouse className="w-5 h-5 text-blue-500" />
                        <h4 className="font-bold text-lg text-gray-800">{w.name}</h4>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{w.location}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteWarehouse(w._id)}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {w.items.length > 0 ? (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-700">
                          Items ({w.items.length})
                        </span>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {w.items.map((i, idx) => (
                          <div
                            key={idx}
                            className="bg-white rounded-lg p-3 text-sm border border-gray-200 hover:border-blue-200 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-800">
                                {i.itemId?.name || "Unknown Item"}
                              </span>
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                                Qty: {i.quantity}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-gray-500 text-xs">
                              <span>SKU: {i.itemId?.sku || "N/A"}</span>
                              {i.zone && (
                                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                  Zone: {i.zone}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 pt-4 border-t border-gray-200 text-center text-gray-500 text-sm">
                      No items assigned
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
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
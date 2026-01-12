import React, { useState, useEffect } from "react";
import axios from "axios";

function LogisticsSupplyChain() {
  const [routes, setRoutes] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [newRoute, setNewRoute] = useState({
    supplier: "",
    warehouse: "",
    customer: "",
    type: "Inbound",
    date: "",
  });

  const API_URL = "http://localhost:8000/api/logistics";
  const SUPPLIER_API = "http://localhost:8000/api/suppliers";

  // Fetch Routes
  const fetchRoutes = async () => {
    try {
      const res = await axios.get(API_URL);
      setRoutes(res.data);
    } catch (err) {
      console.error("Fetch routes error:", err);
    }
  };

  // Fetch Suppliers
  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(SUPPLIER_API);
      if (Array.isArray(res.data)) setSuppliers(res.data);
      else if (res.data && Array.isArray(res.data.suppliers)) setSuppliers(res.data.suppliers);
      else setSuppliers([]);
    } catch (err) {
      console.error("❌ Fetch suppliers error:", err);
      setSuppliers([]);
    }
  };

  useEffect(() => {
    fetchRoutes();
    fetchSuppliers();
  }, []);

  // Add Route
  const addRoute = async () => {
    if (!newRoute.supplier || !newRoute.warehouse || !newRoute.customer || !newRoute.date) {
      alert("Please complete all route details.");
      return;
    }
    try {
      await axios.post(API_URL, newRoute);
      setNewRoute({ supplier: "", warehouse: "", customer: "", type: "Inbound", date: "" });
      fetchRoutes();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add route.");
    }
  };

  // Delete Route
  const deleteRoute = async (id) => {
    if (!window.confirm("Are you sure you want to delete this route?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchRoutes();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete route.");
    }
  };

  // Track Shipment
  const trackShipment = async (id, currentStatus) => {
    let newStatus, newProgress;
    if (currentStatus === "Scheduled") {
      newStatus = "In Transit";
      newProgress = "En route...";
    } else if (currentStatus === "In Transit") {
      newStatus = "Delivered";
      newProgress = "Delivered ✔️";
    } else {
      alert("This shipment is already delivered.");
      return;
    }
    try {
      await axios.put(`${API_URL}/${id}`, { status: newStatus, progress: newProgress });
      fetchRoutes();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Logistics & Transportation Management</h2>
            <p className="text-white/80 text-sm">Manage routes, track shipments, and coordinate deliveries</p>
          </div>
        </div>
      </div>

      {/* Enhanced Add Route Section */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-100 hover:border-indigo-200 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-2 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800">Plan Route</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Supplier
            </label>
            <select
              value={newRoute.supplier}
              onChange={(e) => setNewRoute({ ...newRoute, supplier: e.target.value })}
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 group-hover:border-blue-300 transition-all duration-200 bg-gray-50 focus:bg-white"
            >
              <option value="">Select Supplier</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s.name || s.supplierName}>
                  {s.name || s.supplierName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
              Warehouse
            </label>
            <input
              placeholder="Enter warehouse location"
              value={newRoute.warehouse}
              onChange={(e) => setNewRoute({ ...newRoute, warehouse: e.target.value })}
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 group-hover:border-green-300 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>

          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Customer
            </label>
            <input
              placeholder="Enter customer location"
              value={newRoute.customer}
              onChange={(e) => setNewRoute({ ...newRoute, customer: e.target.value })}
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 group-hover:border-purple-300 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>

          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Route Type
            </label>
            <select
              value={newRoute.type}
              onChange={(e) => setNewRoute({ ...newRoute, type: e.target.value })}
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 group-hover:border-pink-300 transition-all duration-200 bg-gray-50 focus:bg-white"
            >
              <option value="Inbound">Inbound</option>
              <option value="Outbound">Outbound</option>
            </select>
          </div>

          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6" />
              </svg>
              Delivery Date
            </label>
            <input
              type="date"
              value={newRoute.date}
              onChange={(e) => setNewRoute({ ...newRoute, date: e.target.value })}
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 group-hover:border-indigo-300 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={addRoute}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Route
          </button>
        </div>
      </div>

      {/* Enhanced Route Records Table */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-green-200 transition-all duration-300 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Route Records</h3>
              <p className="text-white/80 text-sm">{routes.length} routes managed</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {routes.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
              <p className="text-xl font-semibold text-gray-500">No routes yet</p>
              <p className="text-gray-400 mt-2">Create your first route above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Supplier
                      </div>
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                        Warehouse
                      </div>
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Customer
                      </div>
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Type
                      </div>
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6" />
                        </svg>
                        Date
                      </div>
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Progress</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((r) => (
                    <tr key={r._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-4 px-4 font-medium text-gray-800">{r.supplier}</td>
                      <td className="py-4 px-4 text-gray-600">{r.warehouse}</td>
                      <td className="py-4 px-4 text-gray-600">{r.customer}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-lg text-sm font-medium ${
                          r.type === 'Inbound' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {r.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{r.date}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-lg text-sm font-medium ${
                          r.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          r.status === 'In Transit' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{r.progress}</td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => trackShipment(r._id, r.status)}
                            className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-medium py-2 px-3 rounded-lg text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                          >
                            Track
                          </button>
                          <button
                            onClick={() => deleteRoute(r._id)}
                            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium py-2 px-3 rounded-lg text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                          >
                            Delete
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
    </div>
  );
}

export default LogisticsSupplyChain;

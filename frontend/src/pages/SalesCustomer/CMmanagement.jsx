import React, { useState } from "react";

function CRMManagement() {
  const [customers, setCustomers] = useState([
    { id: 1, name: "Alice Johnson", email: "alice@email.com", preference: "Electronics", history: "Product A", segment: "VIP", logs: ["Called for feedback", "Sent promo email"] },
    { id: 2, name: "Bob Smith", email: "bob@email.com", preference: "Home", history: "Product B", segment: "Regular", logs: ["Requested invoice", "Asked about warranty"] },
  ]);

  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", preference: "", segment: "Regular" });
  const [selectedSegment, setSelectedSegment] = useState("");
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const [newLog, setNewLog] = useState("");
  const [editingLogId, setEditingLogId] = useState(null);
  const [editingLogValue, setEditingLogValue] = useState("");

  const addCustomer = () => {
    if (!newCustomer.name || !newCustomer.email) {
      alert("Please fill in all fields.");
      return;
    }
    setCustomers([...customers, { ...newCustomer, id: customers.length + 1, logs: [] }]);
    setNewCustomer({ name: "", email: "", preference: "", segment: "Regular" });
  };

  const addLog = (customerId) => {
    if (!newLog.trim()) {
      alert("Please enter a log message.");
      return;
    }
    setCustomers(customers.map((c) =>
      c.id === customerId ? { ...c, logs: [...c.logs, newLog] } : c
    ));
    setNewLog("");
  };

  const deleteLog = (customerId, logIndex) => {
    setCustomers(customers.map((c) =>
      c.id === customerId
        ? { ...c, logs: c.logs.filter((_, idx) => idx !== logIndex) }
        : c
    ));
  };

  const updateLog = (customerId, logIndex) => {
    if (!editingLogValue.trim()) {
      alert("Please enter a log message.");
      return;
    }
    setCustomers(customers.map((c) =>
      c.id === customerId
        ? {
            ...c,
            logs: c.logs.map((log, idx) =>
              idx === logIndex ? editingLogValue : log
            ),
          }
        : c
    ));
    setEditingLogId(null);
    setEditingLogValue("");
  };

  const filteredCustomers = selectedSegment
    ? customers.filter((c) => c.segment === selectedSegment)
    : customers;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Customer Relationship Management</h2>
            <p className="text-white/80 text-sm">Manage Customer Data & Communication Logs</p>
          </div>
        </div>
      </div>

      {/* Enhanced Add Customer Form */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-100 hover:border-indigo-200 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-2 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800">Add New Customer</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Customer Name
            </label>
            <input
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 group-hover:border-indigo-300 transition-all duration-200 bg-gray-50 focus:bg-white"
              placeholder="Enter customer name"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
            />
          </div>

          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Address
            </label>
            <input
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 group-hover:border-purple-300 transition-all duration-200 bg-gray-50 focus:bg-white"
              placeholder="Enter email address"
              type="email"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
            />
          </div>

          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Preference
            </label>
            <input
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 group-hover:border-pink-300 transition-all duration-200 bg-gray-50 focus:bg-white"
              placeholder="Customer preference"
              value={newCustomer.preference}
              onChange={(e) => setNewCustomer({ ...newCustomer, preference: e.target.value })}
            />
          </div>

          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Segment
            </label>
            <select 
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 group-hover:border-yellow-300 transition-all duration-200 bg-gray-50 focus:bg-white"
              value={newCustomer.segment} 
              onChange={e => setNewCustomer({ ...newCustomer, segment: e.target.value })}
            >
              <option key="regular" value="Regular">Regular</option>
              <option key="vip" value="VIP">VIP</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button 
            onClick={addCustomer}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Add Customer
          </button>
        </div>
      </div>

      {/* Enhanced Filter Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-2 border-gray-100 hover:border-blue-200 transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-2 shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-800">Filter Customers</h3>
        </div>
        
        <div className="flex flex-col group max-w-xs">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Filter by Segment
          </label>
          <select 
            className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 group-hover:border-blue-300 transition-all duration-200 bg-gray-50 focus:bg-white"
            value={selectedSegment} 
            onChange={e => setSelectedSegment(e.target.value)}
          >
            <option key="all" value="">All Segments</option>
            <option key="regular-filter" value="Regular">Regular</option>
            <option key="vip-filter" value="VIP">VIP</option>
          </select>
        </div>
      </div>

      {/* Enhanced Customer List */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Customer List</h3>
              <p className="text-white/80 text-sm">{filteredCustomers.length} customers</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-xl font-semibold text-gray-500">No customers found</p>
              <p className="text-gray-400 mt-2">Add your first customer above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Preference</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">History</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Segment</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((c) => (
                    <React.Fragment key={c.id}>
                      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                        <td className="py-4 px-4 font-medium text-gray-800">{c.name}</td>
                        <td className="py-4 px-4 text-gray-600">{c.email}</td>
                        <td className="py-4 px-4 text-gray-600">{c.preference}</td>
                        <td className="py-4 px-4 text-gray-600">{c.history}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            c.segment === 'VIP' 
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' 
                              : 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
                          }`}>
                            {c.segment}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                            onClick={() =>
                              setExpandedCustomer(
                                expandedCustomer === c.id ? null : c.id
                              )
                            }
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {expandedCustomer === c.id ? "Hide Logs" : "Manage Logs"}
                          </button>
                        </td>
                      </tr>
                      {expandedCustomer === c.id && (
                        <tr className="bg-gradient-to-r from-gray-50 to-blue-50">
                          <td colSpan="6" className="p-6">
                            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
                              <div className="flex items-center gap-3 mb-6">
                                <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-2 shadow-lg">
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                </div>
                                <h4 className="text-lg font-bold text-gray-800">Communication Logs</h4>
                              </div>
                              
                              <div className="mb-6">
                                {c.logs.length === 0 ? (
                                  <div className="text-center py-8">
                                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <p className="text-gray-500 font-medium">No communication logs yet</p>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {c.logs.map((log, idx) => (
                                      <div key={idx} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border-2 border-gray-100 hover:border-blue-200 transition-all duration-200">
                                        {editingLogId === `${c.id}-${idx}` ? (
                                          <div className="flex gap-3">
                                            <input
                                              type="text"
                                              value={editingLogValue}
                                              onChange={(e) => setEditingLogValue(e.target.value)}
                                              className="flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                            />
                                            <button
                                              onClick={() => updateLog(c.id, idx)}
                                              className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                                            >
                                              Save
                                            </button>
                                            <button
                                              onClick={() => {
                                                setEditingLogId(null);
                                                setEditingLogValue("");
                                              }}
                                              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        ) : (
                                          <div className="flex justify-between items-center">
                                            <span className="text-gray-700 font-medium">{log}</span>
                                            <div className="flex gap-2">
                                              <button
                                                onClick={() => {
                                                  setEditingLogId(`${c.id}-${idx}`);
                                                  setEditingLogValue(log);
                                                }}
                                                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                                              >
                                                Edit
                                              </button>
                                              <button
                                                onClick={() => deleteLog(c.id, idx)}
                                                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                                              >
                                                Delete
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex gap-3">
                                <input
                                  type="text"
                                  placeholder="Add new communication log..."
                                  value={expandedCustomer === c.id ? newLog : ""}
                                  onChange={(e) => setNewLog(e.target.value)}
                                  className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter") addLog(c.id);
                                  }}
                                />
                                <button
                                  onClick={() => addLog(c.id)}
                                  className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  Add Log
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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

export default CRMManagement;

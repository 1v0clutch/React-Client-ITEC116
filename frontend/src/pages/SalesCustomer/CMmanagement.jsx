// CRMManagement.jsx

import React, { useState, useEffect } from "react"; // <-- **FIXED: React is now imported**
import "./Module_8style/CM_management.css";

// Define your API base URL
const API_BASE_URL = "http://localhost:8000/api/crm"; // Assuming your Express server runs on port 8000

function CRMManagement() {
    const [customers, setCustomers] = useState([]);
    const [customerBehaviors, setCustomerBehaviors] = useState([]);
    const [analyticsSummary, setAnalyticsSummary] = useState(null);

    const [newCustomer, setNewCustomer] = useState({ name: "", email: "", preference: "", segment: "Regular" });
    const [selectedSegment, setSelectedSegment] = useState("");
    const [expandedCustomer, setExpandedCustomer] = useState(null);
    const [newLog, setNewLog] = useState("");
    const [editingLogId, setEditingLogId] = useState(null);
    const [editingLogValue, setEditingLogValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("customers");

    // --- Utility Function to Fetch Customers ---
    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/customers`);
            if (!response.ok) throw new Error("Failed to fetch customers");
            const data = await response.json();
            setCustomers(data);
        } catch (error) {
            console.error("Error fetching customers:", error);
            alert(`Error fetching customers: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // --- Utility Function to Calculate Customer Behavior ---
    const calculateBehaviors = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/analytics/calculate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) throw new Error("Failed to calculate behaviors");
            await fetchCustomerBehaviors();
            await fetchAnalyticsSummary();
        } catch (error) {
            console.error("Error calculating behaviors:", error);
        }
    };

    // --- Utility Function to Fetch Customer Behaviors ---
    const fetchCustomerBehaviors = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/analytics/behaviors");
            if (!response.ok) throw new Error("Failed to fetch behaviors");
            const data = await response.json();
            setCustomerBehaviors(data);
        } catch (error) {
            console.error("Error fetching behaviors:", error);
        }
    };

    // --- Utility Function to Fetch Analytics Summary ---
    const fetchAnalyticsSummary = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/analytics/summary");
            if (!response.ok) throw new Error("Failed to fetch summary");
            const data = await response.json();
            setAnalyticsSummary(data);
        } catch (error) {
            console.error("Error fetching summary:", error);
        }
    };

    // --- Initial Data Load ---
    useEffect(() => {
        fetchCustomers();
        calculateBehaviors();
    }, []);

    // --- API Handlers ---

    // CREATE CUSTOMER (POST /api/crm/customers)
    const addCustomer = async () => {
        if (!newCustomer.name || !newCustomer.email) {
            alert("Please fill in Name and Email.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/customers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCustomer),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create customer");
            }

            // Re-fetch the customer list to include the newly created one
            await fetchCustomers();
            setNewCustomer({ name: "", email: "", preference: "", segment: "Regular" });
            alert("Customer successfully added!");
        } catch (error) {
            console.error("Error adding customer:", error);
            alert(`Error adding customer: ${error.message}`);
        }
    };

    // CREATE LOG (POST /api/crm/customers/:id/logs)
    const addLog = async (customerId) => {
        if (!newLog.trim()) {
            alert("Please enter a log message.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/customers/${customerId}/logs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: newLog }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to add log");
            }

            // Update local state with the saved customer data (which includes the new log)
            const { customer: updatedCustomer } = await response.json();
            setCustomers(customers.map(c => c._id === customerId ? updatedCustomer : c));

            setNewLog("");
        } catch (error) {
            console.error("Error adding log:", error);
            alert(`Error adding log: ${error.message}`);
        }
    };

    // DELETE LOG (DELETE /api/crm/customers/:id/logs/:logId)
    // logId is the Mongoose _id of the nested log document
    const deleteLog = async (customerId, logId) => {
        if (!window.confirm("Are you sure you want to delete this log entry?")) return;

        try {
            const response = await fetch(`${API_BASE_URL}/customers/${customerId}/logs/${logId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete log");
            }

            // Update local state by removing the log
            const { customer: updatedCustomer } = await response.json();
            setCustomers(customers.map(c => c._id === customerId ? updatedCustomer : c));

        } catch (error) {
            console.error("Error deleting log:", error);
            alert(`Error deleting log: ${error.message}`);
        }
    };

    // UPDATE LOG (PUT /api/crm/customers/:id/logs/:logId)
    const updateLog = async (customerId, logId) => {
        if (!editingLogValue.trim()) {
            alert("Log message cannot be empty.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/customers/${customerId}/logs/${logId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: editingLogValue }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update log");
            }

            // Update local state
            const { customer: updatedCustomer } = await response.json();
            setCustomers(customers.map(c => c._id === customerId ? updatedCustomer : c));

            setEditingLogId(null);
            setEditingLogValue("");
        } catch (error) {
            console.error("Error updating log:", error);
            alert(`Error updating log: ${error.message}`);
        }
    };

    // --- Filtering Logic (Client-side) ---
    const filteredCustomers = selectedSegment
        ? customers.filter((c) => c.segment === selectedSegment)
        : customers;

    // --- Render Logic ---
    return (
        <div className="crm-container">
            <h2>Customer Relationship Management (CRM)</h2>

            {/* --- Tab Navigation --- */}
            <div className="crm-tabs">
                <button
                    className={`tab-btn ${activeTab === "customers" ? "active" : ""}`}
                    onClick={() => setActiveTab("customers")}
                >
                    Customers & Logs
                </button>
                <button
                    className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`}
                    onClick={() => setActiveTab("analytics")}
                >
                    Customer Analytics
                </button>
            </div>

            {activeTab === "customers" && (
            <>
            {/* --- Add Customer Form --- */}
            <div className="form-card">
                <label>Name</label>
                <input
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                />
                <label>Email</label>
                <input
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                />
                <label>Preference</label>
                <input
                    value={newCustomer.preference}
                    onChange={(e) => setNewCustomer({ ...newCustomer, preference: e.target.value })}
                />
                {/* History is now read-only, updated by logs/orders on the backend */}
                <label>Segment</label>
                <select value={newCustomer.segment} onChange={e => setNewCustomer({ ...newCustomer, segment: e.target.value })}>
                    <option value="Regular">Regular</option>
                    <option value="VIP">VIP</option>
                </select>
                <button onClick={addCustomer}>Add Customer</button>
            </div>

            {/* --- Filter --- */}
            <div className="form-card">
                <label>Filter by Segment</label>
                <select value={selectedSegment} onChange={e => setSelectedSegment(e.target.value)}>
                    <option value="">All</option>
                    <option value="Regular">Regular</option>
                    <option value="VIP">VIP</option>
                </select>
            </div>

            {/* --- Customer List --- */}
            <h3>Customer List</h3>
            {loading ? (
                <p>Loading customers...</p>
            ) : filteredCustomers.length === 0 ? (
                <p>No customers found.</p>
            ) : (
                <div className="crm-table-container">
                    <table className="crm-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Preference</th>
                                <th>History</th>
                                <th>Segment</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map((c) => (
                                <React.Fragment key={c._id}>
                                    <tr key={c._id}>
                                        <td>{c.name}</td>
                                        <td>{c.email}</td>
                                        <td>{c.preference}</td>
                                        <td>{c.history}</td>
                                        <td>
                                            <span className={`segment-badge ${c.segment.toLowerCase()}`}>
                                                {c.segment}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn-manage"
                                                onClick={() =>
                                                    setExpandedCustomer(
                                                        expandedCustomer === c._id ? null : c._id
                                                    )
                                                }
                                            >
                                                {expandedCustomer === c._id ? "Hide" : "Manage Logs"}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedCustomer === c._id && (
                                        <tr className="expanded-row">
                                            <td colSpan="6">
                                                <div className="log-management">
                                                    <h4>Communication Logs</h4>
                                                    <div className="logs-section">
                                                        {c.logs.length === 0 ? (
                                                            <p className="no-logs">No logs yet</p>
                                                        ) : (
                                                            <ul className="logs-list-edit">
                                                                {c.logs.map((log) => (
                                                                    // Log now has its own Mongoose _id
                                                                    <li key={log._id} className="log-item">
                                                                        {editingLogId === `${c._id}-${log._id}` ? (
                                                                            <div className="log-edit">
                                                                                <input
                                                                                    type="text"
                                                                                    value={editingLogValue}
                                                                                    onChange={(e) =>
                                                                                        setEditingLogValue(e.target.value)
                                                                                    }
                                                                                    className="log-input"
                                                                                />
                                                                                <button
                                                                                    onClick={() =>
                                                                                        updateLog(c._id, log._id) // Use log._id for update
                                                                                    }
                                                                                    className="btn-save"
                                                                                >
                                                                                    Save
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setEditingLogId(null);
                                                                                        setEditingLogValue("");
                                                                                    }}
                                                                                    className="btn-cancel"
                                                                                >
                                                                                    Cancel
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="log-display">
                                                                                {/* Display log message and timestamp (optional) */}
                                                                                <span>
                                                                                    {log.message} 
                                                                                    <span style={{ fontSize: '0.8em', color: '#888', marginLeft: '10px' }}>
                                                                                        ({new Date(log.createdAt).toLocaleDateString()})
                                                                                    </span>
                                                                                </span>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setEditingLogId(`${c._id}-${log._id}`);
                                                                                        setEditingLogValue(log.message);
                                                                                    }}
                                                                                    className="btn-edit"
                                                                                >
                                                                                    Edit
                                                                                </button>
                                                                                <button
                                                                                    onClick={() =>
                                                                                        deleteLog(c._id, log._id) // Use log._id for delete
                                                                                    }
                                                                                    className="btn-delete-log"
                                                                                >
                                                                                    Delete
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                    <div className="add-log-section">
                                                        <input
                                                            type="text"
                                                            placeholder="Add new communication log..."
                                                            value={
                                                                expandedCustomer === c._id ? newLog : ""
                                                            }
                                                            onChange={(e) => setNewLog(e.target.value)}
                                                            className="log-input"
                                                            onKeyPress={(e) => {
                                                                if (e.key === "Enter")
                                                                    addLog(c._id);
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => addLog(c._id)}
                                                            className="btn-add-log"
                                                        >
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
            </>
            )}

            {activeTab === "analytics" && (
            <>
                <div className="form-card">
                    <h3>Analytics Summary</h3>
                    <button onClick={calculateBehaviors} className="btn-refresh">
                        Refresh Analytics
                    </button>
                    {analyticsSummary && (
                        <div className="analytics-summary">
                            <div className="summary-stat">
                                <span className="stat-label">Total Customers:</span>
                                <span className="stat-value">{analyticsSummary.totalCustomers}</span>
                            </div>
                            <div className="summary-stat">
                                <span className="stat-label">Avg Loyalty Score:</span>
                                <span className="stat-value">{analyticsSummary.averageLoyaltyScore}</span>
                            </div>
                            <div className="summary-stat">
                                <span className="stat-label">Total Orders:</span>
                                <span className="stat-value">{analyticsSummary.totalOrdersAllCustomers}</span>
                            </div>
                            <div className="summary-stat">
                                <span className="stat-label">Total Revenue:</span>
                                <span className="stat-value">${analyticsSummary.totalRevenueAllCustomers}</span>
                            </div>
                            <div className="summary-stat">
                                <span className="stat-label">Frequent Buyers:</span>
                                <span className="stat-value">{analyticsSummary.frequentBuyers}</span>
                            </div>
                            <div className="summary-stat">
                                <span className="stat-label">High Risk:</span>
                                <span className="stat-value">{analyticsSummary.highRiskCustomers}</span>
                            </div>
                            <div className="summary-stat">
                                <span className="stat-label">High Value:</span>
                                <span className="stat-value">{analyticsSummary.highValueCustomers}</span>
                            </div>
                            <div className="summary-stat">
                                <span className="stat-label">Conversion Rate:</span>
                                <span className="stat-value">{analyticsSummary.conversionRateAverage}%</span>
                            </div>
                        </div>
                    )}
                </div>

                <h3>Customer Behavior & Buying Trends</h3>
                {customerBehaviors.length === 0 ? (
                    <p>No customer behavior data available.</p>
                ) : (
                    <div className="analytics-table-container">
                        <table className="analytics-table">
                            <thead>
                                <tr>
                                    <th>Customer Name</th>
                                    <th>Segment</th>
                                    <th>Total Orders</th>
                                    <th>Total Spent</th>
                                    <th>Avg Order Value</th>
                                    <th>Quotations</th>
                                    <th>Conversion Rate</th>
                                    <th>Order Frequency</th>
                                    <th>Last Order</th>
                                    <th>Loyalty Score</th>
                                    <th>Risk Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customerBehaviors.map((behavior) => (
                                    <tr key={behavior._id}>
                                        <td>{behavior.customerId?.name || "Unknown"}</td>
                                        <td>
                                            <span className={`segment-badge ${behavior.customerId?.segment?.toLowerCase()}`}>
                                                {behavior.customerId?.segment}
                                            </span>
                                        </td>
                                        <td>{behavior.totalOrders}</td>
                                        <td>${behavior.totalSpent}</td>
                                        <td>${behavior.averageOrderValue}</td>
                                        <td>{behavior.totalQuotations}</td>
                                        <td>{behavior.conversionRate}%</td>
                                        <td>
                                            <span className={`frequency-badge ${behavior.orderFrequency}`}>
                                                {behavior.orderFrequency}
                                            </span>
                                        </td>
                                        <td>
                                            {behavior.lastOrderDate
                                                ? new Date(behavior.lastOrderDate).toLocaleDateString()
                                                : "N/A"}
                                        </td>
                                        <td>
                                            <div className="loyalty-score">
                                                <div className="score-bar">
                                                    <div
                                                        className="score-fill"
                                                        style={{
                                                            width: `${behavior.loyaltyScore}%`,
                                                            backgroundColor:
                                                                behavior.loyaltyScore >= 75
                                                                    ? "#4CAF50"
                                                                    : behavior.loyaltyScore >= 50
                                                                    ? "#FFC107"
                                                                    : "#F44336",
                                                        }}
                                                    ></div>
                                                </div>
                                                <span>{behavior.loyaltyScore}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`risk-badge ${behavior.riskCategory}`}>
                                                {behavior.riskCategory.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </>
            )}
        </div>
    );
}

export default CRMManagement;
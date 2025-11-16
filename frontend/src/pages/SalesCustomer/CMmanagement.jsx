import { useState } from "react";
import "./Module_8style/CM_management.css";

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
    <div className="crm-container">
      <h2>Customer Relationship Management (CRM)</h2>

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
        <label>Segment</label>
        <select value={newCustomer.segment} onChange={e => setNewCustomer({ ...newCustomer, segment: e.target.value })}>
          <option value="Regular">Regular</option>
          <option value="VIP">VIP</option>
        </select>
        <button onClick={addCustomer}>Add Customer</button>
      </div>

      <div className="form-card">
        <label>Filter by Segment</label>
        <select value={selectedSegment} onChange={e => setSelectedSegment(e.target.value)}>
          <option value="">All</option>
          <option value="Regular">Regular</option>
          <option value="VIP">VIP</option>
        </select>
      </div>

      <h3>Customer List</h3>
      {filteredCustomers.length === 0 ? (
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
                <>
                  <tr key={c.id}>
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
                            expandedCustomer === c.id ? null : c.id
                          )
                        }
                      >
                        {expandedCustomer === c.id ? "Hide" : "Manage Logs"}
                      </button>
                    </td>
                  </tr>
                  {expandedCustomer === c.id && (
                    <tr className="expanded-row">
                      <td colSpan="6">
                        <div className="log-management">
                          <h4>Communication Logs</h4>
                          <div className="logs-section">
                            {c.logs.length === 0 ? (
                              <p className="no-logs">No logs yet</p>
                            ) : (
                              <ul className="logs-list-edit">
                                {c.logs.map((log, idx) => (
                                  <li key={idx} className="log-item">
                                    {editingLogId === `${c.id}-${idx}` ? (
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
                                            updateLog(c.id, idx)
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
                                        <span>{log}</span>
                                        <button
                                          onClick={() => {
                                            setEditingLogId(`${c.id}-${idx}`);
                                            setEditingLogValue(log);
                                          }}
                                          className="btn-edit"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() =>
                                            deleteLog(c.id, idx)
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
                                expandedCustomer === c.id ? newLog : ""
                              }
                              onChange={(e) => setNewLog(e.target.value)}
                              className="log-input"
                              onKeyPress={(e) => {
                                if (e.key === "Enter")
                                  addLog(c.id);
                              }}
                            />
                            <button
                              onClick={() => addLog(c.id)}
                              className="btn-add-log"
                            >
                              Add Log
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CRMManagement;

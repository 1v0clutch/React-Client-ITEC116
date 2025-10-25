import { useState } from "react";
import "./Module_8style/CM_management.css";

function CRMManagement() {
  const [customers, setCustomers] = useState([
    { id: 1, name: "Alice Johnson", email: "alice@email.com", preference: "Electronics", history: "Product A", segment: "VIP", logs: ["Called for feedback", "Sent promo email"] },
    { id: 2, name: "Bob Smith", email: "bob@email.com", preference: "Home", history: "Product B", segment: "Regular", logs: ["Requested invoice", "Asked about warranty"] },
  ]);

  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", preference: "", segment: "Regular" });
  const [selectedSegment, setSelectedSegment] = useState("");

  const addCustomer = () => {
    if (!newCustomer.name || !newCustomer.email) {
      alert("Please fill in all fields.");
      return;
    }
    setCustomers([...customers, { ...newCustomer, id: customers.length + 1, logs: [] }]);
    setNewCustomer({ name: "", email: "", preference: "", segment: "Regular" });
  };

  // Filter customers by segment
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
      {filteredCustomers.map((c) => (
        <div key={c.id} className="crm-card">
          <p>
            <strong>{c.name}</strong> ({c.email}) <br />
            Preference: {c.preference} <br />
            Purchase History: {c.history} <br />
            Segment: {c.segment}
          </p>
          <div>
            <strong>Communication Logs:</strong>
            <ul>
              {c.logs.map((log, idx) => <li key={idx}>{log}</li>)}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CRMManagement;

import { useState, useEffect } from "react";
import "./Module_8style/After_Sales.css";
function AfterSalesSupport() {
  const [departments, setDepartments] = useState([]);
  const [cases, setCases] = useState([]);
  const [newCase, setNewCase] = useState({ customer: "", issue: "", status: "open", assignedTo: "", satisfaction: 0 });

  useEffect(() => {
    fetchDepartments();
    fetchCases();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/departments");
      const data = await res.json();
      console.log("Fetched departments:", data);
      setDepartments(data);
      if (data.length > 0) {
        setNewCase((prev) => ({ ...prev, assignedTo: data[0].name }));
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const fetchCases = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/support-cases");
      const data = await res.json();
      console.log("Fetched cases:", data);
      setCases(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching cases:", err);
    }
  };

  const addCase = async () => {
    if (!newCase.customer || !newCase.issue) {
      alert("Please enter customer and issue details.");
      return;
    }
    try {
      const res = await fetch("http://localhost:8000/api/support-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCase),
      });
      const createdCase = await res.json();
      setCases([...cases, createdCase]);
      setNewCase({ customer: "", issue: "", status: "open", assignedTo: departments.length > 0 ? departments[0].name : "", satisfaction: 0 });
      alert("Case added successfully!");
    } catch (err) {
      console.error("Error adding case:", err);
      alert("Error adding case");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:8000/api/support-cases/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const updated = await res.json();
      setCases(cases.map((c) => (c._id === id ? updated : c)));
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const updateAssignment = async (id, assignedTo) => {
    try {
      const res = await fetch(`http://localhost:8000/api/support-cases/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo }),
      });
      const updated = await res.json();
      setCases(cases.map((c) => (c._id === id ? updated : c)));
    } catch (err) {
      console.error("Error updating assignment:", err);
    }
  };

  const updateSatisfaction = async (id, satisfaction) => {
    try {
      const res = await fetch(`http://localhost:8000/api/support-cases/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ satisfaction }),
      });
      const updated = await res.json();
      setCases(cases.map((c) => (c._id === id ? updated : c)));
    } catch (err) {
      console.error("Error updating satisfaction:", err);
    }
  };

  const deleteCase = async (id) => {
    if (!window.confirm("Are you sure you want to delete this case?")) return;
    try {
      await fetch(`http://localhost:8000/api/support-cases/${id}`, {
        method: "DELETE",
      });
      setCases(cases.filter((c) => c._id !== id));
      alert("Case deleted successfully!");
    } catch (err) {
      console.error("Error deleting case:", err);
      alert("Error deleting case");
    }
  };

  return (
    <div className="aftersales-container">
      <h2>After-Sales Support & Case Management</h2>

      <div className="form-card">
        <label>Customer Name</label>
        <input
          value={newCase.customer}
          onChange={(e) => setNewCase({ ...newCase, customer: e.target.value })}
        />
        <label>Issue</label>
        <input
          value={newCase.issue}
          onChange={(e) => setNewCase({ ...newCase, issue: e.target.value })}
        />
        <label>Assign to Team</label>
        <select value={newCase.assignedTo} onChange={e => setNewCase({ ...newCase, assignedTo: e.target.value })}>
          {departments.length === 0 ? (
            <option value="">No departments available</option>
          ) : (
            departments.map((dept) => (
              <option key={dept._id} value={dept.name}>
                {dept.name}
              </option>
            ))
          )}
        </select>
        <label>Satisfaction (1-5)</label>
        <input type="number" min={1} max={5} value={newCase.satisfaction} onChange={e => setNewCase({ ...newCase, satisfaction: parseInt(e.target.value) })} />
        <button onClick={addCase}>Add Case</button>
      </div>

      <h3>Support Cases</h3>
      {cases.length === 0 ? (
        <p className="no-cases">No cases yet.</p>
      ) : (
        <div className="table-wrapper">
          <table className="cases-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Customer</th>
                <th>Issue</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Satisfaction</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c._id}>
                  <td>#{c._id?.toString().slice(-6)}</td>
                  <td>{c.customer}</td>
                  <td>{c.issue}</td>
                  <td>
                    <select value={c.status} onChange={e => updateStatus(c._id, e.target.value)} className="table-select">
                      <option value="open">open</option>
                      <option value="in progress">in progress</option>
                      <option value="resolved">resolved</option>
                    </select>
                  </td>
                  <td>
                    <select value={c.assignedTo} onChange={e => updateAssignment(c._id, e.target.value)} className="table-select">
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input type="number" min={1} max={5} value={c.satisfaction} onChange={e => updateSatisfaction(c._id, parseInt(e.target.value))} className="satisfaction-input" />
                  </td>
                  <td>
                    <button onClick={() => deleteCase(c._id)} className="btn-delete-case">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AfterSalesSupport;

import { useState } from "react";
import "./Module_8style/After_Sales.css";
function AfterSalesSupport() {
  const [cases, setCases] = useState([
    // Example dummy cases
    { id: 1, customer: "Alice Johnson", issue: "Warranty claim", status: "open", assignedTo: "Team A", satisfaction: 4 },
    { id: 2, customer: "Bob Smith", issue: "Service request", status: "in progress", assignedTo: "Team B", satisfaction: 3 },
  ]);
  const [newCase, setNewCase] = useState({ customer: "", issue: "", status: "open", assignedTo: "Team A", satisfaction: 0 });

  const addCase = () => {
    if (!newCase.customer || !newCase.issue) {
      alert("Please enter customer and issue details.");
      return;
    }
    setCases([...cases, { ...newCase, id: cases.length + 1 }]);
    setNewCase({ customer: "", issue: "", status: "open", assignedTo: "Team A", satisfaction: 0 });
  };

  const updateStatus = (id, status) => {
    setCases(cases.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  const updateAssignment = (id, team) => {
    setCases(cases.map((c) => (c.id === id ? { ...c, assignedTo: team } : c)));
  };

  const updateSatisfaction = (id, rating) => {
    setCases(cases.map((c) => (c.id === id ? { ...c, satisfaction: rating } : c)));
  };

  const deleteCase = (id) => {
    setCases(cases.filter((c) => c.id !== id));
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
          <option value="Team A">Team A</option>
          <option value="Team B">Team B</option>
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
                <tr key={c.id}>
                  <td>#{c.id}</td>
                  <td>{c.customer}</td>
                  <td>{c.issue}</td>
                  <td>
                    <select value={c.status} onChange={e => updateStatus(c.id, e.target.value)} className="table-select">
                      <option value="open">open</option>
                      <option value="in progress">in progress</option>
                      <option value="resolved">resolved</option>
                    </select>
                  </td>
                  <td>
                    <select value={c.assignedTo} onChange={e => updateAssignment(c.id, e.target.value)} className="table-select">
                      <option value="Team A">Team A</option>
                      <option value="Team B">Team B</option>
                    </select>
                  </td>
                  <td>
                    <input type="number" min={1} max={5} value={c.satisfaction} onChange={e => updateSatisfaction(c.id, parseInt(e.target.value))} className="satisfaction-input" />
                  </td>
                  <td>
                    <button onClick={() => deleteCase(c.id)} className="btn-delete-case">Delete</button>
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

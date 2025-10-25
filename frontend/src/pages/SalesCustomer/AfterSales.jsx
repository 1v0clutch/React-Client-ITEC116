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
      {cases.map((c) => (
        <div key={c.id} className="case-card">
          <p>
            <strong>Case #{c.id}</strong><br />
            Customer: {c.customer} <br />
            Issue: {c.issue} <br />
            Status: {c.status} <br />
            Assigned To: {c.assignedTo} <br />
            Satisfaction: {c.satisfaction}
          </p>
          <select value={c.status} onChange={e => updateStatus(c.id, e.target.value)}>
            <option value="open">open</option>
            <option value="in progress">in progress</option>
            <option value="resolved">resolved</option>
          </select>
          <select value={c.assignedTo} onChange={e => updateAssignment(c.id, e.target.value)}>
            <option value="Team A">Team A</option>
            <option value="Team B">Team B</option>
          </select>
          <input type="number" min={1} max={5} value={c.satisfaction} onChange={e => updateSatisfaction(c.id, parseInt(e.target.value))} />
        </div>
      ))}
    </div>
  );
}

export default AfterSalesSupport;

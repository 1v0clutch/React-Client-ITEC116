import React, { useState, useEffect } from "react";

export default function EmployeeForm() {
  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    position: "",
    department: "",
    employmentType: "Full Time",
    hireDate: "",
    status: "Active",
  });

  const [employees, setEmployees] = useState([]);

  const DEPARTMENTS = ["HR", "Finance", "IT", "Marketing", "Sales"];
  const EMPLOYMENT_TYPES = ["Full Time", "Part Time", "Contract"];
  const STATUS_OPTIONS = ["Active", "Inactive", "On Leave"];

  // Fetch employees to auto-generate employeeId
  useEffect(() => {
    fetch("http://localhost:8000/api/employee")
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data);
        generateEmployeeId(data);
      })
      .catch((err) => console.error("Error fetching employees:", err));
  }, []);

  // Generate next Employee ID
  const generateEmployeeId = (existingEmployees) => {
    if (!existingEmployees || existingEmployees.length === 0) {
      setFormData((prev) => ({ ...prev, employeeId: "EMP-001" }));
      return;
    }
    const ids = existingEmployees.map((emp) =>
      parseInt(emp.employeeId.replace("EMP-", ""), 10)
    );
    const maxId = Math.max(...ids);
    const nextId = (maxId + 1).toString().padStart(3, "0");
    setFormData((prev) => ({ ...prev, employeeId: "EMP-" + nextId }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/api/employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json();
        alert(
          "Failed to add employee: " + (errData.message || "Unknown error")
        );
        return;
      }

      const data = await response.json();
      alert("✅ Employee added successfully: " + data.name);

      // Reset form and generate next Employee ID
      setFormData({
        employeeId: "",
        name: "",
        position: "",
        department: "",
        employmentType: "Full Time",
        hireDate: "",
        status: "Active",
      });
      generateEmployeeId([...employees, data]);
      setEmployees((prev) => [...prev, data]);
    } catch (err) {
      alert("❌ Error adding employee: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "500px", margin: "auto" }}>
      <div>
        <label>Employee ID:</label>
        <input
          type="text"
          name="employeeId"
          value={formData.employeeId}
          readOnly
        />
      </div>

      <div>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Position:</label>
        <input
          type="text"
          name="position"
          value={formData.position}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Department:</label>
        <select
          name="department"
          value={formData.department}
          onChange={handleChange}
          required
        >
          <option value="">Select Department</option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Employment Type:</label>
        <select
          name="employmentType"
          value={formData.employmentType}
          onChange={handleChange}
          required
        >
          {EMPLOYMENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Hire Date:</label>
        <input
          type="date"
          name="hireDate"
          value={formData.hireDate}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Status:</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" style={{ marginTop: "10px" }}>
        Submit
      </button>
    </form>
  );
}

import React, { useState } from "react";

export default function Dashboard({ data, setData }) {
  const leaves = data?.leaves || [];
  const [activeTab, setActiveTab] = useState("overview"); // overview | applicants
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicant, setApplicant] = useState({
    id: "",
    name: "",
    email: "",
    position: "",
    resume: "",
  });

  const pendingLeaves = leaves.filter((l) => l.status === "Pending");

  // Add new applicant
  const addApplicant = () => {
    if (!applicant.name || !applicant.email || !applicant.position) {
      alert("Please fill in all required fields.");
      return;
    }
    const newApplicant = {
      ...applicant,
      id: Date.now(),
      status: "Pending",
      interviewDate: "",
    };
    setData({
      ...data,
      applicants: [...(data.applicants || []), newApplicant],
    });
    setApplicant({ id: "", name: "", email: "", position: "", resume: "" });
    setShowApplicationForm(false);
    setActiveTab("applicants"); // after submit, go to applicants tab
  };

  // Update applicant status
  const updateStatus = (id, status) => {
    setData({
      ...data,
      applicants: data.applicants.map((a) =>
        a.id === id
          ? {
              ...a,
              status: status === "Approved" ? "Interview Scheduled" : status,
            }
          : a
      ),
    });
  };

  // Update interview date
  const updateInterviewDate = (id, date) => {
    setData({
      ...data,
      applicants: data.applicants.map((a) =>
        a.id === id ? { ...a, interviewDate: date } : a
      ),
    });
    alert("Interview scheduled successfully!");
  };

  // Delete applicant
  const deleteApplicant = (id) => {
    setData({
      ...data,
      applicants: data.applicants.filter((a) => a.id !== id),
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Tabs */}
      <div className="flex mb-6 gap-4">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 font-semibold rounded ${
            activeTab === "overview" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("applicants")}
          className={`px-4 py-2 font-semibold rounded ${
            activeTab === "applicants" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Applicants
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          <h2 className="text-xl font-bold mb-4">Dashboard Overview</h2>

          {/* Quick Stats */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Quick Overview</h3>
            <ul className="list-disc ml-5 space-y-1">
              <li>Registered Employees: {data.employees.length}</li>
              <li>Departments: {data.departments.length}</li>
              <li>Pending Leaves: {pendingLeaves.length}</li>
            </ul>
          </div>

          {/* Pending Leaves */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Pending Leave Requests</h3>
            {pendingLeaves.length > 0 ? (
              <ul className="list-disc ml-5 space-y-1">
                {pendingLeaves.map((l) => (
                  <li key={l.id}>
                    <span className="font-medium">{l.employee}</span> - {l.type} (
                    {l.start} to {l.end})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No pending leaves.</p>
            )}
          </div>

          {/* Apply Button */}
          <div className="p-4 bg-blue-50 border rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Join Our Team!</h3>
            <p className="mb-3 text-sm text-gray-600">
              Interested in working with us? Click below to apply.
            </p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => setShowApplicationForm(!showApplicationForm)}
            >
              {showApplicationForm ? "Close Form" : "Apply for Work"}
            </button>
          </div>

          {/* Application Form */}
          {showApplicationForm && (
            <div className="mt-4 bg-white p-4 border rounded-lg shadow">
              <h4 className="text-md font-semibold mb-3">Job Application</h4>
              <div className="grid gap-3">
                <input
                  value={applicant.name}
                  onChange={(e) => setApplicant({ ...applicant, name: e.target.value })}
                  placeholder="Full Name"
                  className="border p-2 rounded"
                />
                <input
                  type="email"
                  value={applicant.email}
                  onChange={(e) => setApplicant({ ...applicant, email: e.target.value })}
                  placeholder="Email"
                  className="border p-2 rounded"
                />
                <input
                  value={applicant.position}
                  onChange={(e) => setApplicant({ ...applicant, position: e.target.value })}
                  placeholder="Desired Position"
                  className="border p-2 rounded"
                />
                <input
                  type="file"
                  onChange={(e) =>
                    setApplicant({
                      ...applicant,
                      resume: e.target.files[0]?.name || "",
                    })
                  }
                  className="border p-2 rounded"
                />
                <button
                  onClick={addApplicant}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Submit Application
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Applicants Tab */}
      {activeTab === "applicants" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Applicants History</h2>
          {data.applicants && data.applicants.length > 0 ? (
            <table className="w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2 text-left">Name</th>
                  <th className="border px-3 py-2 text-left">Email</th>
                  <th className="border px-3 py-2 text-left">Position</th>
                  <th className="border px-3 py-2 text-left">Resume</th>
                  <th className="border px-3 py-2 text-left">Status</th>
                  <th className="border px-3 py-2 text-left">Interview Date</th>
                  <th className="border px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.applicants.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{a.name}</td>
                    <td className="border px-3 py-2">{a.email}</td>
                    <td className="border px-3 py-2">{a.position}</td>
                    <td className="border px-3 py-2">{a.resume || "N/A"}</td>
                    <td className="border px-3 py-2">{a.status}</td>
                    <td className="border px-3 py-2">
                      {a.status === "Interview Scheduled" ? (
                        <input
                          type="date"
                          value={a.interviewDate || ""}
                          onChange={(e) =>
                            updateInterviewDate(a.id, e.target.value)
                          }
                          className="border p-1 rounded"
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="border px-3 py-2">
                      {a.status === "Pending" && (
                        <>
                          <button
                            onClick={() => updateStatus(a.id, "Approved")}
                            className="bg-green-500 text-white px-2 py-1 rounded mr-2 hover:bg-green-600"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(a.id, "Rejected")}
                            className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteApplicant(a.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 italic">No applicants yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

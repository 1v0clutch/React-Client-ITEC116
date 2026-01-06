import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:8000/api";

export default function Dashboard({ data, setData }) {
  const employees = data?.employees || [];
  const departments = data?.departments || [];
  const applicants = data?.applicants || [];
  
  const [activeTab, setActiveTab] = useState("overview");
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applicant, setApplicant] = useState({
    id: "",
    name: "",
    email: "",
    position: "",
    contact: "",
  });

  // Fetch pending leaves from API
  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const fetchPendingLeaves = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/leaves`);
      if (response.ok) {
        const result = await response.json();
        const allLeaves = result.data || result || [];
        const pending = allLeaves.filter(leave => leave.status === "Pending");
        setPendingLeaves(pending);
      }
    } catch (error) {
      console.error("Error fetching pending leaves:", error);
      setPendingLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  // Update leave status
  const updateLeaveStatus = async (leaveId, status) => {
    try {
      const response = await fetch(`${API_BASE}/leaves/${leaveId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        // Refresh pending leaves after update
        fetchPendingLeaves();
        alert(`Leave ${status.toLowerCase()} successfully!`);
      }
    } catch (error) {
      console.error("Error updating leave status:", error);
      alert("Failed to update leave status");
    }
  };

  // Validate PH contact number
  const isValidPHNumber = (num) => {
    const phRegex = /^(?:\+63|0)9\d{9}$/;
    return phRegex.test(num);
  };

  // Add new applicant
  const addApplicant = () => {
    if (!applicant.name || !applicant.email || !applicant.position || !applicant.contact) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!isValidPHNumber(applicant.contact)) {
      alert("Please enter a valid Philippine contact number (e.g., +639123456789 or 09123456789).");
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
    setApplicant({ id: "", name: "", email: "", position: "", contact: "" });
    setShowApplicationForm(false);
    setActiveTab("applicants");
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your workforce efficiently</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "overview"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("applicants")}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "applicants"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Applicants
            </button>
          </div>
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="px-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{employees.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-green-600 font-medium">
                  {employees.filter(emp => emp.status === "Active").length} Active
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Departments</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{departments.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Leaves</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{pendingLeaves.length}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-yellow-600 font-medium">
                  Requires attention
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Job Applicants</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{applicants.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Leaves Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Pending Leave Requests</h2>
                <button
                  onClick={fetchPendingLeaves}
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading pending leaves...</span>
                </div>
              ) : pendingLeaves.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No pending leaves</h3>
                  <p className="mt-1 text-sm text-gray-500">All leave requests have been processed.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingLeaves.map((leave, index) => (
                        <tr key={leave._id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {(leave.name || leave.employee || "").charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{leave.name || leave.employee}</div>
                                <div className="text-sm text-gray-500">{leave.empId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {leave.type || leave.leaveType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>{leave.startDate}</div>
                            <div className="text-gray-500">to {leave.endDate}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            {leave.reason}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => updateLeaveStatus(leave._id, "Approved")}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateLeaveStatus(leave._id, "Rejected")}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Job Application Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Join Our Team</h2>
              <p className="text-gray-600 mt-1">Interested in working with us? Apply now!</p>
            </div>
            
            <div className="p-6">
              <button
                onClick={() => setShowApplicationForm(!showApplicationForm)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                {showApplicationForm ? "Close Application Form" : "Apply for a Position"}
              </button>

              {showApplicationForm && (
                <div className="mt-6 bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Job Application Form</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={applicant.name}
                      onChange={(e) => setApplicant({ ...applicant, name: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={applicant.email}
                      onChange={(e) => setApplicant({ ...applicant, email: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Desired Position"
                      value={applicant.position}
                      onChange={(e) => setApplicant({ ...applicant, position: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Contact Number (+639 or 09...)"
                      value={applicant.contact}
                      onChange={(e) => setApplicant({ ...applicant, contact: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={addApplicant}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                    >
                      Submit Application
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "applicants" && (
        <div className="px-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Job Applicants</h2>
              <p className="text-gray-600 mt-1">Manage job applications and interview schedules</p>
            </div>
            
            <div className="p-6">
              {applicants.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No applicants yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Job applications will appear here when submitted.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interview Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {applicants.map((applicant) => (
                        <tr key={applicant.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {applicant.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{applicant.name}</div>
                                <div className="text-sm text-gray-500">{applicant.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {applicant.position}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {applicant.contact}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              applicant.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                              applicant.status === "Interview Scheduled" ? "bg-blue-100 text-blue-800" :
                              applicant.status === "Approved" ? "bg-green-100 text-green-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {applicant.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {applicant.status === "Interview Scheduled" ? (
                              <input
                                type="date"
                                value={applicant.interviewDate || ""}
                                onChange={(e) => updateInterviewDate(applicant.id, e.target.value)}
                                className="block w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {applicant.status === "Pending" && (
                              <>
                                <button
                                  onClick={() => updateStatus(applicant.id, "Approved")}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => updateStatus(applicant.id, "Rejected")}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => deleteApplicant(applicant.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 transition-colors"
                            >
                              Delete
                            </button>
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
      )}
    </div>
  );
}
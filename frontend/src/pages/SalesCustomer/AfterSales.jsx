import { useState } from "react";

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">After-Sales Support</h2>
            <p className="text-white/80 text-sm">Manage Customer Support Cases & Satisfaction</p>
          </div>
        </div>
      </div>

      {/* Enhanced Add Case Form */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-100 hover:border-indigo-200 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-2 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800">Create New Support Case</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              value={newCase.customer}
              onChange={(e) => setNewCase({ ...newCase, customer: e.target.value })}
            />
          </div>

          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Issue Description
            </label>
            <input
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 group-hover:border-purple-300 transition-all duration-200 bg-gray-50 focus:bg-white"
              placeholder="Describe the issue"
              value={newCase.issue}
              onChange={(e) => setNewCase({ ...newCase, issue: e.target.value })}
            />
          </div>

          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Assign to Team
            </label>
            <select 
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 group-hover:border-pink-300 transition-all duration-200 bg-gray-50 focus:bg-white"
              value={newCase.assignedTo} 
              onChange={e => setNewCase({ ...newCase, assignedTo: e.target.value })}
            >
              <option key="team-a" value="Team A">Team A</option>
              <option key="team-b" value="Team B">Team B</option>
            </select>
          </div>

          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Satisfaction (1-5)
            </label>
            <input 
              type="number" 
              min={1} 
              max={5} 
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 group-hover:border-yellow-300 transition-all duration-200 bg-gray-50 focus:bg-white"
              placeholder="Rate 1-5"
              value={newCase.satisfaction} 
              onChange={e => setNewCase({ ...newCase, satisfaction: parseInt(e.target.value) })} 
            />
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button 
            onClick={addCase}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Support Case
          </button>
        </div>
      </div>

      {/* Enhanced Cases List */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Support Cases</h3>
              <p className="text-white/80 text-sm">{cases.length} active cases</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {cases.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-xl font-semibold text-gray-500">No support cases yet</p>
              <p className="text-gray-400 mt-2">Create your first support case above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Case ID</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Customer</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Issue</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Assigned To</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Satisfaction</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c) => (
                    <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-4 px-4">
                        <span className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          #{c.id}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-800">{c.customer}</td>
                      <td className="py-4 px-4 text-gray-600">{c.issue}</td>
                      <td className="py-4 px-4">
                        <select 
                          className="border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                          value={c.status} 
                          onChange={e => updateStatus(c.id, e.target.value)}
                        >
                          <option key="open" value="open">Open</option>
                          <option key="in-progress" value="in progress">In Progress</option>
                          <option key="resolved" value="resolved">Resolved</option>
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        <select 
                          className="border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                          value={c.assignedTo} 
                          onChange={e => updateAssignment(c.id, e.target.value)}
                        >
                          <option key="team-a-table" value="Team A">Team A</option>
                          <option key="team-b-table" value="Team B">Team B</option>
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        <input 
                          type="number" 
                          min={1} 
                          max={5} 
                          className="w-16 border-2 border-gray-200 rounded-lg px-2 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 bg-gray-50 focus:bg-white text-sm text-center"
                          value={c.satisfaction} 
                          onChange={e => updateSatisfaction(c.id, parseInt(e.target.value))} 
                        />
                      </td>
                      <td className="py-4 px-4">
                        <button 
                          className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-lg text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                          onClick={() => deleteCase(c.id)}
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
  );
}

export default AfterSalesSupport;

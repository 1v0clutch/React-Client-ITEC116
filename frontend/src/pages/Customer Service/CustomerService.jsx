import React, { useState, useEffect } from "react";

// Unique ID generator
const uid = () => Math.random().toString(36).slice(2, 9);

const SAMPLE_ARTICLES = [
  { id: 1, title: "How to Reset Your Password", category: "Account", content: "Go to your profile > settings > reset password." },
  { id: 2, title: "Troubleshooting Login Issues", category: "Account", content: "Check your internet connection or try clearing cookies." },
  { id: 3, title: "How to Track Your Orders", category: "Orders", content: "Visit 'My Orders' page and click 'Track Order' for details." },
];

export default function HelpdeskSystem() {
  const [tickets, setTickets] = useState(() => JSON.parse(localStorage.getItem("tickets")) || []);
  const [panel, setPanel] = useState("tickets");
  const [showDetail, setShowDetail] = useState(false);
  const [detailTicket, setDetailTicket] = useState(null);
  const [newTicket, setNewTicket] = useState({ customer: "", subject: "", description: "", priority: "Medium" });

  // SLA configuration
  const [sla, setSla] = useState(() => JSON.parse(localStorage.getItem("sla")) || { response: 2, resolution: 24 }); // in hours

  // Update localStorage
  useEffect(() => {
    localStorage.setItem("tickets", JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem("sla", JSON.stringify(sla));
  }, [sla]);

  // Periodic SLA check
  useEffect(() => {
    const interval = setInterval(() => {
      checkSLACompliance();
    }, 60000); // every minute
    return () => clearInterval(interval);
  }, [tickets, sla]);

  // Create new ticket
  const createTicket = () => {
    if (!newTicket.customer || !newTicket.subject) return alert("Please fill out all fields");
    const now = new Date().toISOString();
    const ticket = {
      id: uid(),
      ...newTicket,
      status: "Open",
      agent: "Unassigned",
      created: now,
      firstResponse: null,
      resolved: null,
      escalated: false,
      updates: [],
      messages: [],
    };
    setTickets((prev) => [...prev, ticket]);
    setNewTicket({ customer: "", subject: "", description: "", priority: "Medium" });
  };

  // Update ticket status (includes auto follow-up)
  const updateTicketStatus = (id, status) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;

        const newUpdates = [...(t.updates || []), `Status changed to ${status} at ${new Date().toLocaleString()}`];
        let newMessages = [...(t.messages || [])];

        if (["In Progress"].includes(status) && !t.firstResponse) {
          t.firstResponse = new Date().toISOString();
        }

        if (["Resolved", "Closed"].includes(status)) {
          newMessages.push({
            id: uid(),
            from: "System",
            text: `Hello ${t.customer}, your ticket "${t.subject}" has been ${status.toLowerCase()}. We’d love your feedback!`,
            time: new Date().toISOString(),
          });
          if (!t.resolved) t.resolved = new Date().toISOString();
        }

        return { ...t, status, updates: newUpdates, messages: newMessages };
      })
    );
  };

  // SLA Checker
  const checkSLACompliance = () => {
    const now = new Date();
    setTickets((prev) =>
      prev.map((t) => {
        if (t.status === "Closed" || t.escalated) return t;
        const createdTime = new Date(t.created);
        const responseDeadline = new Date(createdTime.getTime() + sla.response * 60 * 60 * 1000);
        const resolutionDeadline = new Date(createdTime.getTime() + sla.resolution * 60 * 60 * 1000);

        if (!t.firstResponse && now > responseDeadline) {
          return {
            ...t,
            escalated: true,
            updates: [...(t.updates || []), `SLA Violation: No response within ${sla.response} hours.`],
            messages: [
              ...(t.messages || []),
              {
                id: uid(),
                from: "System",
                text: `⚠️ Ticket escalated — no response within ${sla.response} hours.`,
                time: now.toISOString(),
              },
            ],
          };
        }

        if (!t.resolved && now > resolutionDeadline) {
          return {
            ...t,
            escalated: true,
            updates: [...(t.updates || []), `SLA Violation: Resolution exceeded ${sla.resolution} hours.`],
            messages: [
              ...(t.messages || []),
              {
                id: uid(),
                from: "System",
                text: `⚠️ Ticket escalated — not resolved within ${sla.resolution} hours.`,
                time: now.toISOString(),
              },
            ],
          };
        }

        return t;
      })
    );
  };

  // Update ticket fields
  const updateTicketField = (id, changes) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updates = [
          ...(t.updates || []),
          `Updated fields: ${Object.keys(changes).join(", ")} at ${new Date().toLocaleString()}`,
        ];
        const messages = [...(t.messages || [])];
        if (changes.agent && changes.agent !== t.agent) {
          messages.push({
            id: uid(),
            from: "System",
            text: `Agent reassigned to ${changes.agent}`,
            time: new Date().toISOString(),
          });
        }
        return { ...t, ...changes, updates, messages };
      })
    );
    if (detailTicket && detailTicket.id === id) {
      setDetailTicket((d) => ({ ...d, ...changes }));
    }
  };

  // Messaging
  const sendMessage = (ticketId, text, from) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const newMsg = { id: uid(), from, text, time: new Date().toISOString() };
        return { ...t, messages: [...(t.messages || []), newMsg] };
      })
    );
  };

  // Derived data for Communication History
  const customerConversations = tickets.reduce((acc, t) => {
    if (!t.customer) return acc;
    if (!acc[t.customer]) acc[t.customer] = [];
    acc[t.customer].push(...(t.messages || []));
    return acc;
  }, {});

  // SLA Performance Metrics
  const totalTickets = tickets.length;
  const metSLA = tickets.filter((t) => !t.escalated).length;
  const performance = totalTickets > 0 ? ((metSLA / totalTickets) * 100).toFixed(1) : 100;

  // Open/close details
  const openDetail = (t) => {
    setDetailTicket(t);
    setShowDetail(true);
  };
  const closeDetail = () => {
    setShowDetail(false);
    setDetailTicket(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Helpdesk System</h1>
              <p className="text-white/80 text-sm">Comprehensive Customer Support Management</p>
            </div>
          </div>
          <div className="flex gap-2">
            {["tickets", "articles", "history", "sla"].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-xl transition-all duration-300 font-medium ${
                  panel === tab 
                    ? "bg-white text-indigo-700 shadow-lg transform scale-105" 
                    : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                }`}
                onClick={() => setPanel(tab)}
              >
                {tab === "tickets"
                  ? "Tickets"
                  : tab === "articles"
                  ? "Self-Service Portal"
                  : tab === "history"
                  ? "Communication History"
                  : "SLA Tracking"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PANELS */}
      {/* 1️⃣ Ticket Management */}
      {panel === "tickets" && (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-[60%] bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100 hover:border-indigo-200 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-2 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Create New Ticket</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div className="flex flex-col group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Customer Name
                </label>
                <input
                  type="text"
                  placeholder="Enter customer name"
                  value={newTicket.customer}
                  onChange={(e) => setNewTicket({ ...newTicket, customer: e.target.value })}
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 group-hover:border-indigo-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>

              <div className="flex flex-col group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="Enter ticket subject"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 group-hover:border-purple-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>

              <div className="flex flex-col group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Description
                </label>
                <textarea
                  placeholder="Describe the issue in detail"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 group-hover:border-pink-300 transition-all duration-200 bg-gray-50 focus:bg-white min-h-[100px]"
                />
              </div>

              <div className="flex flex-col group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Priority
                </label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 group-hover:border-yellow-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </div>

            <div className="flex justify-center mb-8">
              <button 
                onClick={createTicket} 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Submit Ticket
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-2 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Ticket List</h2>
                <p className="text-gray-600 text-sm">{tickets.length} active tickets</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              {tickets.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-lg font-semibold text-gray-500">No tickets yet</p>
                  <p className="text-gray-400 mt-2">Create your first support ticket above</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {tickets.map((t) => (
                    <li 
                      key={t.id} 
                      onClick={() => openDetail(t)} 
                      className="bg-white p-4 rounded-xl cursor-pointer hover:shadow-md transition-all duration-200 border-2 border-transparent hover:border-indigo-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-indigo-700 text-lg">{t.subject}</div>
                        {t.escalated && (
                          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">
                            Escalated
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-2 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {t.customer}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          {t.priority}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {t.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Enhanced Ticket Detail */}
          {showDetail && detailTicket && (
            <div className="w-full md:w-[35%] bg-white rounded-2xl shadow-xl border-2 border-indigo-200 p-6 sticky top-6 self-start">
              <button 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors" 
                onClick={closeDetail}
              >
                ×
              </button>
              
              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">{detailTicket.subject}</h2>
                <p className="text-gray-600">{detailTicket.customer}</p>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <div className="text-sm text-gray-700 mb-2 italic">
                  Hello {detailTicket.customer}, thanks for reaching out! 💬
                </div>
                <div className="text-xs text-gray-500">
                  You have submitted {tickets.filter((t) => t.customer === detailTicket.customer).length} ticket(s) so far.
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-gray-700 text-sm">{detailTicket.description}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={detailTicket.status}
                    onChange={(e) => updateTicketStatus(detailTicket.id, e.target.value)}
                    className="border-2 border-gray-200 rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  >
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                    <option>Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Assigned Agent</label>
                  <input
                    type="text"
                    value={detailTicket.agent}
                    onChange={(e) => updateTicketField(detailTicket.id, { agent: e.target.value })}
                    className="border-2 border-gray-200 rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    placeholder="Enter agent name"
                  />
                </div>

                <button
                  onClick={() =>
                    sendMessage(
                      detailTicket.id,
                      `Hello ${detailTicket.customer}, just following up on your ticket "${detailTicket.subject}". Is everything resolved?`,
                      "Agent"
                    )
                  }
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Send Follow-up Message
                </button>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Messages
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto">
                  {detailTicket.messages && detailTicket.messages.length > 0 ? (
                    <div className="space-y-3">
                      {detailTicket.messages.map((m) => (
                        <div key={m.id} className="bg-white rounded-lg p-3 shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm text-indigo-600">{m.from}</span>
                            <span className="text-xs text-gray-400">{new Date(m.time).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-gray-700">{m.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p className="text-gray-500 text-sm">No messages yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2️⃣ Enhanced Self-Service Portal */}
      {panel === "articles" && (
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Self-Service Portal</h2>
                <p className="text-white/80 text-sm">Find answers to common questions</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid gap-4">
              {SAMPLE_ARTICLES.map((a) => (
                <div key={a.id} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-blue-200">
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg p-2 flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg mb-2">{a.title}</h3>
                      <p className="text-gray-600 mb-3">{a.content}</p>
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                          {a.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3️⃣ Enhanced Communication History */}
      {panel === "history" && (
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-purple-200 transition-all duration-300 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Customer Communication History</h2>
                <p className="text-white/80 text-sm">View all customer conversations</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {Object.keys(customerConversations).length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                <p className="text-xl font-semibold text-gray-500">No customer conversations yet</p>
                <p className="text-gray-400 mt-2">Conversations will appear here once tickets are created</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(customerConversations).map(([customer, messages]) => (
                  <div key={customer} className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl p-6 border-2 border-transparent hover:border-purple-200 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-full p-2">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{customer}</h3>
                        <p className="text-sm text-gray-600">{messages.length} messages</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 max-h-64 overflow-y-auto">
                      <div className="space-y-3">
                        {messages.map((m) => (
                          <div key={m.id} className="border-l-4 border-purple-200 pl-4 py-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm text-purple-600">{m.from}</span>
                              <span className="text-xs text-gray-400">{new Date(m.time).toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-gray-700">{m.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4️⃣ Enhanced SLA Tracking */}
      {panel === "sla" && (
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-green-200 transition-all duration-300 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Service Level Agreement Tracking</h2>
                <p className="text-white/80 text-sm">Monitor and configure SLA performance</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex flex-col group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Response Time Limit (hours)
                </label>
                <input
                  type="number"
                  value={sla.response}
                  onChange={(e) => setSla({ ...sla, response: Number(e.target.value) })}
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 group-hover:border-green-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>
              <div className="flex flex-col group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Resolution Time Limit (hours)
                </label>
                <input
                  type="number"
                  value={sla.resolution}
                  onChange={(e) => setSla({ ...sla, resolution: Number(e.target.value) })}
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 group-hover:border-emerald-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-full p-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">SLA Performance Report</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{totalTickets}</div>
                  <div className="text-sm font-medium text-gray-600">Total Tickets</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="text-3xl font-bold text-green-600 mb-2">{metSLA}</div>
                  <div className="text-sm font-medium text-gray-600">Tickets Meeting SLA</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">{performance}%</div>
                  <div className="text-sm font-medium text-gray-600">Compliance Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

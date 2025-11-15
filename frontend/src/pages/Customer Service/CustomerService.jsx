import React, { useState, useEffect } from "react";


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

  // pag config ng sla
  const [sla, setSla] = useState(() => JSON.parse(localStorage.getItem("sla")) || { response: 2, resolution: 24 }); // in hours

  // pag update ng local storage
  useEffect(() => {
    localStorage.setItem("tickets", JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem("sla", JSON.stringify(sla));
  }, [sla]);

  // sla check
  useEffect(() => {
    const interval = setInterval(() => {
      checkSLACompliance();
    }, 60000); // every minute
    return () => clearInterval(interval);
  }, [tickets, sla]);

  // para makagawa ng new ticket
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

  // pang update ng ticket status ksama ng auto-follow up
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

  // pang sla check
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

  // for updation ng field ng ticket
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

  // message
  const sendMessage = (ticketId, text, from) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const newMsg = { id: uid(), from, text, time: new Date().toISOString() };
        return { ...t, messages: [...(t.messages || []), newMsg] };
      })
    );
  };

  // pang derived ng data sa communication history
  const customerConversations = tickets.reduce((acc, t) => {
    if (!t.customer) return acc;
    if (!acc[t.customer]) acc[t.customer] = [];
    acc[t.customer].push(...(t.messages || []));
    return acc;
  }, {});

  // metrics ng sla performance
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
    <div className="min-h-screen bg-blue-100 p-6">
      {/* HEADER */}
      <div className="bg-blue-600 text-white p-4 rounded-lg mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Helpdesk System</h1>
        <div className="flex gap-2">
          {["tickets", "articles", "history", "sla"].map((tab) => (
            <button
              key={tab}
              className={`border px-4 py-2 rounded-lg transition ${
                panel === tab ? "bg-white text-blue-700 font-semibold shadow" : "bg-transparent text-white hover:bg-white/20"
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

      
      {/* 1 Ticket Management */}
      {panel === "tickets" && (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-[60%] bg-white rounded-lg p-4 shadow">
            <h2 className="text-lg font-bold mb-3 text-blue-700">Create New Ticket</h2>
            <input
              type="text"
              placeholder="Customer Name"
              value={newTicket.customer}
              onChange={(e) => setNewTicket({ ...newTicket, customer: e.target.value })}
              className="border rounded w-full p-2 mb-2"
            />
            <input
              type="text"
              placeholder="Subject"
              value={newTicket.subject}
              onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
              className="border rounded w-full p-2 mb-2"
            />
            <textarea
              placeholder="Description"
              value={newTicket.description}
              onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
              className="border rounded w-full p-2 mb-2"
            ></textarea>
            <select
              value={newTicket.priority}
              onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
              className="border rounded w-full p-2 mb-2"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
            <button onClick={createTicket} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Submit Ticket
            </button>

            <h2 className="text-lg font-bold mt-6 mb-3 text-blue-700">Ticket List</h2>
            <ul className="divide-y">
              {tickets.map((t) => (
                <li key={t.id} onClick={() => openDetail(t)} className="py-2 cursor-pointer hover:bg-blue-50 px-2 rounded transition">
                  <div className="font-semibold text-blue-700">{t.subject}</div>
                  <div className="text-sm text-gray-600">
                    {t.customer} • {t.priority} • {t.status} {t.escalated && <span className="text-red-600 font-bold">(Escalated)</span>}
                  </div>
                </li>
              ))}
              {tickets.length === 0 && <p className="text-center text-gray-500 mt-2">No tickets yet.</p>}
            </ul>
          </div>

          {/* Ticket Detail */}
          {showDetail && detailTicket && (
            <div className="w-full md:w-[35%] bg-white rounded-xl border-2 border-blue-300 shadow p-5 sticky top-6 self-start">
              <button className="absolute top-2 right-4 text-gray-500 text-xl" onClick={closeDetail}>
                ×
              </button>
              <h2 className="text-lg font-bold mb-1 text-center text-blue-700">{detailTicket.subject}</h2>
              <p className="text-center text-sm text-gray-500 mb-3">{detailTicket.customer}</p>

              <div className="text-sm text-gray-600 mb-2 italic">
                Hello {detailTicket.customer}, thanks for reaching out! 💬
              </div>
              <div className="text-xs text-gray-500 mb-2">
                You have submitted {tickets.filter((t) => t.customer === detailTicket.customer).length} ticket(s) so far.
              </div>

              <p className="text-gray-700 mb-2">{detailTicket.description}</p>

              <div className="text-sm mb-2">
                <b>Status:</b> {detailTicket.status}
              </div>
              <select
                value={detailTicket.status}
                onChange={(e) => updateTicketStatus(detailTicket.id, e.target.value)}
                className="border rounded w-full p-1 mb-2"
              >
                <option>Open</option>
                <option>In Progress</option>
                <option>Resolved</option>
                <option>Closed</option>
              </select>

              <div className="text-sm mb-2">
                <b>Agent:</b>{" "}
                <input
                  type="text"
                  value={detailTicket.agent}
                  onChange={(e) => updateTicketField(detailTicket.id, { agent: e.target.value })}
                  className="border rounded w-full p-1 mt-1"
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
                className="border rounded px-3 py-1 hover:bg-green-500 mb-3"
              >
                Send Follow-up
              </button>

              <h3 className="font-semibold text-blue-700 mt-3 mb-2">Messages</h3>
              <ul className="bg-gray-100 rounded p-2 max-h-48 overflow-y-auto">
                {detailTicket.messages && detailTicket.messages.length > 0 ? (
                  detailTicket.messages.map((m) => (
                    <li key={m.id} className="text-sm mb-1">
                      <b>{m.from}:</b> {m.text}{" "}
                      <span className="text-xs text-gray-400">• {new Date(m.time).toLocaleString()}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No messages yet.</p>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 2️ Self-Service Portal */}
      {panel === "articles" && (
        <section className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-3 text-center text-blue-700">Self-Service Portal</h2>
          {SAMPLE_ARTICLES.map((a) => (
            <div key={a.id} className="border rounded-lg p-4 mb-3 hover:bg-blue-50 transition">
              <h3 className="font-bold text-blue-700">{a.title}</h3>
              <p className="text-gray-700 text-sm mt-1">{a.content}</p>
              <p className="text-xs text-gray-500 mt-1 italic">Category: {a.category}</p>
            </div>
          ))}
        </section>
      )}

      {/* 3️ Communication History */}
      {panel === "history" && (
        <section className="bg-white rounded shadow p-5">
          <h2 className="text-xl font-semibold mb-3 text-center text-blue-700">Customer Communication History</h2>
          {Object.keys(customerConversations).length === 0 ? (
            <p className="text-center text-gray-500">No customer conversations yet.</p>
          ) : (
            <ul className="divide-y">
              {Object.entries(customerConversations).map(([customer, messages]) => (
                <li key={customer} className="py-3">
                  <h3 className="font-semibold text-lg text-blue-600 mb-2">{customer}</h3>
                  <ul className="ml-4 text-sm text-gray-700 max-h-48 overflow-y-auto">
                    {messages.map((m) => (
                      <li key={m.id} className="mb-1">
                        <b>{m.from}:</b> {m.text}{" "}
                        <span className="text-xs text-gray-400">• {new Date(m.time).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* 4️ SLA Tracking */}
      {panel === "sla" && (
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-center text-blue-700">Service Level Agreement Tracking</h2>

          <div className="flex flex-col md:flex-row justify-center gap-6 mb-6">
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-semibold mb-1">Response Time Limit (hours)</label>
              <input
                type="number"
                value={sla.response}
                onChange={(e) => setSla({ ...sla, response: Number(e.target.value) })}
                className="border rounded w-full p-2"
              />
            </div>
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-semibold mb-1">Resolution Time Limit (hours)</label>
              <input
                type="number"
                value={sla.resolution}
                onChange={(e) => setSla({ ...sla, resolution: Number(e.target.value) })}
                className="border rounded w-full p-2"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-4 text-center">
            <p className="text-lg font-semibold text-blue-700 mb-2">SLA Performance Report</p>
            <p>Total Tickets: {totalTickets}</p>
            <p>Tickets Meeting SLA: {metSLA}</p>
            <p className="text-green-600 font-bold mt-1">Compliance Rate: {performance}%</p>
          </div>
        </section>
      )}
    </div>
  );
}

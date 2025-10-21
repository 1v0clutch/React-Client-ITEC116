import React, { useState, useEffect } from "react";

// --- SAMPLE ARTICLES ---
const SAMPLE_ARTICLES = [
  { id: 1, title: "Reset Password", category: "Account", body: "Click 'Forgot password' at login and follow the steps.", helpful: 0, notHelpful: 0 },
  { id: 2, title: "Check Order Status", category: "Orders", body: "Go to Orders → Enter your order ID to see updates.", helpful: 0, notHelpful: 0 },
  { id: 3, title: "Refund Policy", category: "Payments", body: "Refunds processed within 14 business days.", helpful: 0, notHelpful: 0 },
];

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// --- LOCAL STORAGE HELPERS ---
const getTickets = () => JSON.parse(localStorage.getItem("helpdesk_tickets") || "[]");
const saveTickets = (tickets) => localStorage.setItem("helpdesk_tickets", JSON.stringify(tickets));

export default function HelpdeskSystem() {
  const [panel, setPanel] = useState("tickets");
  const [tickets, setTickets] = useState(getTickets());
  const [articles, setArticles] = useState(() => {
    const stored = localStorage.getItem("helpdesk_articles");
    if (stored) return JSON.parse(stored);
    localStorage.setItem("helpdesk_articles", JSON.stringify(SAMPLE_ARTICLES));
    return SAMPLE_ARTICLES;
  });
  const [form, setForm] = useState({ customer: "", subject: "", description: "", priority: "Medium", agent: "", sla_hours: 24 });
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [detailTicket, setDetailTicket] = useState(null);
  const [note, setNote] = useState("");

  // --- AUTO SAVE ---
  useEffect(() => {
    saveTickets(tickets);
  }, [tickets]);

  // --- SLA AUTO ESCALATION ---
  useEffect(() => {
    const now = new Date();
    const updated = tickets.map((t) => {
      const created = new Date(t.created);
      const hoursPassed = (now - created) / 3600000;
      if (hoursPassed > t.sla_hours && t.status !== "Closed") {
        return { ...t, status: "Escalated" };
      }
      return t;
    });
    setTickets(updated);
  }, []);

  // --- FILTERED TICKETS ---
  const filteredTickets = tickets.filter((t) => {
    let match = true;
    if (search && !(t.customer.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase()))) match = false;
    if (filterStatus && t.status !== filterStatus) match = false;
    if (filterPriority && t.priority !== filterPriority) match = false;
    return match;
  });

  // --- CREATE TICKET ---
  const handleFormChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleCreateTicket = (e) => {
    e.preventDefault();
    const newTicket = {
      id: uid(),
      ...form,
      status: "Open",
      created: new Date().toISOString(),
      updates: [],
      messages: [],
    };
    setTickets((t) => [newTicket, ...t]);
    setForm({ customer: "", subject: "", description: "", priority: "Medium", agent: "", sla_hours: 24 });
  };

  // --- TICKET DETAIL MODAL ---
  const openDetail = (t) => {
    setDetailTicket(t);
    setShowDetail(true);
  };
  const closeDetail = () => {
    setShowDetail(false);
    setDetailTicket(null);
  };

  // --- UPDATE STATUS / ADD NOTE ---
  const updateTicketStatus = (status) => {
    const updated = tickets.map((t) =>
      t.id === detailTicket.id ? { ...t, status, updates: [...t.updates, `Status changed to ${status}`] } : t
    );
    setTickets(updated);
    setDetailTicket((t) => ({ ...t, status }));
  };

  const addInternalNote = () => {
    if (!note.trim()) return;
    const updated = tickets.map((t) =>
      t.id === detailTicket.id ? { ...t, updates: [...t.updates, note] } : t
    );
    setTickets(updated);
    setDetailTicket((t) => ({ ...t, updates: [...t.updates, note] }));
    setNote("");
  };

  // --- CUSTOMER COMMUNICATION LOG ---
  const sendMessage = (msg) => {
    if (!msg.trim()) return;
    const updated = tickets.map((t) =>
      t.id === detailTicket.id ? { ...t, messages: [...t.messages, { from: "Agent", text: msg, time: new Date().toISOString() }] } : t
    );
    setTickets(updated);
    setDetailTicket((t) => ({ ...t, messages: [...t.messages, { from: "Agent", text: msg, time: new Date().toISOString() }] }));
  };

  // --- SLA REPORT ---
  const slaReport = tickets.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  // --- EXPORT CSV ---
  const exportCSV = () => {
    const rows = [
      ["Customer", "Subject", "Priority", "Agent", "SLA Hours", "Status", "Created"],
      ...tickets.map((t) => [t.customer, t.subject, t.priority, t.agent, t.sla_hours, t.status, t.created]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SLA_Report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- ARTICLE FEEDBACK ---
  const rateArticle = (id, helpful) => {
    const updated = articles.map((a) =>
      a.id === id ? { ...a, helpful: a.helpful + (helpful ? 1 : 0), notHelpful: a.notHelpful + (!helpful ? 1 : 0) } : a
    );
    setArticles(updated);
    localStorage.setItem("helpdesk_articles", JSON.stringify(updated));
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900">
      <header className="bg-gradient-to-r from-blue-700 to-sky-400 text-white p-4">
        <h1 className="text-xl font-bold">Helpdesk & Customer Service System</h1>
        <nav className="mt-2 flex gap-2">
          {["tickets", "portal", "reports"].map((p) => (
            <button
              key={p}
              className={`border px-3 py-1 rounded ${panel === p ? "bg-white text-blue-700 font-semibold" : "text-white"}`}
              onClick={() => setPanel(p)}
            >
              {p === "tickets" ? "Tickets" : p === "portal" ? "Self-Service Portal" : "SLA Reports"}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* --- TICKETS --- */}
        {panel === "tickets" && (
          <section className="flex gap-6">
            {/* Left: Create Ticket */}
            <div className="flex-1 bg-white rounded shadow p-4">
              <h2 className="text-lg font-semibold mb-2">Create New Ticket</h2>
              <form onSubmit={handleCreateTicket} className="flex flex-col gap-2">
                <input name="customer" placeholder="Customer Name" value={form.customer} onChange={handleFormChange} required className="border rounded px-2 py-1" />
                <input name="subject" placeholder="Subject" value={form.subject} onChange={handleFormChange} required className="border rounded px-2 py-1" />
                <textarea name="description" placeholder="Issue description" value={form.description} onChange={handleFormChange} required rows={3} className="border rounded px-2 py-1" />
                <select name="priority" value={form.priority} onChange={handleFormChange} className="border rounded px-2 py-1">
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
                <input name="agent" placeholder="Assign Agent" value={form.agent} onChange={handleFormChange} className="border rounded px-2 py-1" />
                <input name="sla_hours" type="number" min="1" value={form.sla_hours} onChange={handleFormChange} className="border rounded px-2 py-1" placeholder="SLA Hours" />
                <button className="bg-blue-700 text-white rounded px-3 py-2 mt-2">Create Ticket</button>
              </form>
              <h3 className="mt-6 mb-2 font-semibold">Filters</h3>
              <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="border rounded px-2 py-1 mb-2 w-full" />
              <div className="flex gap-2 mb-2">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border rounded px-2 py-1">
                  <option value="">All Status</option><option>Open</option><option>In Progress</option><option>Resolved</option><option>Closed</option><option>Escalated</option>
                </select>
                <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="border rounded px-2 py-1">
                  <option value="">All Priority</option><option>Low</option><option>Medium</option><option>High</option>
                </select>
              </div>
              <ul className="divide-y">
                {filteredTickets.map((t) => (
                  <li key={t.id} className="py-2 hover:bg-blue-50 cursor-pointer" onClick={() => openDetail(t)}>
                    <div className="font-semibold">{t.subject} <span className="text-xs text-gray-500">({t.priority})</span></div>
                    <div className="text-sm text-gray-600">{t.customer}</div>
                    <div className="text-xs text-gray-400">{t.status} • {new Date(t.created).toLocaleString()}</div>
                  </li>
                ))}
                {filteredTickets.length === 0 && <li className="text-gray-400 py-2">No tickets found.</li>}
              </ul>
            </div>

            {/* --- Ticket Detail --- */}
            {showDetail && detailTicket && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded shadow-lg p-6 w-[420px] relative">
                  <button onClick={closeDetail} className="absolute top-2 right-3 text-gray-500 text-xl">×</button>
                  <h2 className="text-lg font-bold mb-2">{detailTicket.subject}</h2>
                  <div className="text-sm mb-1"><b>Customer:</b> {detailTicket.customer}</div>
                  <div className="text-sm mb-1"><b>Priority:</b> {detailTicket.priority}</div>
                  <div className="text-sm mb-1"><b>Agent:</b> {detailTicket.agent}</div>
                  <div className="text-sm mb-1"><b>Status:</b> {detailTicket.status}</div>
                  <div className="text-sm mb-3"><b>SLA:</b> {detailTicket.sla_hours} hrs</div>

                  <h3 className="font-semibold mt-3 mb-1">Internal Notes</h3>
                  <ul className="text-xs mb-2 list-disc list-inside text-gray-600">
                    {detailTicket.updates.map((u, i) => <li key={i}>{u}</li>)}
                  </ul>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add note..." className="border rounded w-full px-2 py-1 text-sm" />
                  <button onClick={addInternalNote} className="bg-blue-600 text-white rounded px-3 py-1 mt-1 text-sm">Add Note</button>

                  <h3 className="font-semibold mt-4 mb-1">Messages</h3>
                  <ul className="max-h-32 overflow-y-auto text-sm border rounded p-2 bg-gray-50 mb-2">
                    {detailTicket.messages.map((m, i) => (
                      <li key={i}><b>{m.from}:</b> {m.text} <span className="text-xs text-gray-400">{new Date(m.time).toLocaleString()}</span></li>
                    ))}
                  </ul>
                  <input
                    placeholder="Send message..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage(e.target.value)}
                    className="border rounded px-2 py-1 w-full text-sm"
                  />

                  <div className="flex justify-between mt-3">
                    {["In Progress", "Resolved", "Closed"].map((s) => (
                      <button key={s} onClick={() => updateTicketStatus(s)} className="text-xs border rounded px-2 py-1 hover:bg-blue-100">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* --- SELF-SERVICE PORTAL --- */}
        {panel === "portal" && (
          <section className="bg-white rounded shadow p-4">
            <h2 className="text-lg font-semibold mb-2">Self-Service Portal</h2>
            <input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded px-2 py-1 mb-3 w-full"
            />
            <ul className="divide-y">
              {articles
                .filter((a) => a.title.toLowerCase().includes(search.toLowerCase()))
                .map((a) => (
                  <li key={a.id} className="py-2">
                    <div className="font-semibold">{a.title} <span className="text-xs text-gray-500">[{a.category}]</span></div>
                    <div className="text-sm text-gray-600 mb-1">{a.body}</div>
                    <div className="text-xs text-gray-500">
                      Helpful?{" "}
                      <button onClick={() => rateArticle(a.id, true)} className="text-green-600 mr-2">Yes ({a.helpful})</button>
                      <button onClick={() => rateArticle(a.id, false)} className="text-red-600">No ({a.notHelpful})</button>
                    </div>
                  </li>
                ))}
            </ul>
          </section>
        )}

        {/* --- SLA REPORTS --- */}
        {panel === "reports" && (
          <section className="bg-white rounded shadow p-4">
            <h2 className="text-lg font-semibold mb-3">SLA Reports</h2>
            <button onClick={exportCSV} className="bg-blue-600 text-white rounded px-3 py-2 mb-3">Export CSV</button>
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">Status</th>
                  <th className="border px-2 py-1">Count</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(slaReport).map(([status, count]) => (
                  <tr key={status}>
                    <td className="border px-2 py-1">{status}</td>
                    <td className="border px-2 py-1">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}

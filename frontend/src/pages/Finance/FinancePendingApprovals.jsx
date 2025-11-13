import React, { useMemo, useState } from "react";
import FinanceLayout from "./FinanceLayout";

const HISTORY_STORAGE_KEY = "financeApprovalHistory";
const DECISION_OWNER = "Finance Approver";

const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

const initialRequests = [
  {
    id: "REQ-1045",
    type: "Supplier Payment",
    requester: "Procurement",
    submitted: "2025-10-23T08:45:00Z",
    amount: 84500,
    priority: "High",
    status: "Pending",
  },
  {
    id: "REQ-1046",
    type: "Expense Reimbursement",
    requester: "Marketing",
    submitted: "2025-10-22T11:20:00Z",
    amount: 12800,
    priority: "Medium",
    status: "Pending",
  },
  {
    id: "REQ-1047",
    type: "Capital Expenditure",
    requester: "Operations",
    submitted: "2025-10-21T15:10:00Z",
    amount: 215000,
    priority: "High",
    status: "Pending",
  },
  {
    id: "REQ-1048",
    type: "Subscription Renewal",
    requester: "IT",
    submitted: "2025-10-20T09:30:00Z",
    amount: 45600,
    priority: "Low",
    status: "Approved",
  },
];

const getStatusTone = (status) => {
  const normalized = status.toLowerCase();
  if (normalized === "approved") return "bg-emerald-100 text-emerald-700";
  if (normalized === "rejected") return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700";
};

const getPriorityTone = (priority) => {
  const normalized = priority.toLowerCase();
  if (normalized === "high") return "text-rose-600";
  if (normalized === "medium") return "text-amber-600";
  return "text-slate-500";
};

const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

const storeHistoryRecord = (record) => {
  if (typeof window === "undefined") return;
  try {
    const existing = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    const parsed = existing ? JSON.parse(existing) : [];
    const next = Array.isArray(parsed) ? [...parsed, record] : [record];
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify([record]));
  }
};

export default function FinancePendingApprovals() {
  const [requests, setRequests] = useState(initialRequests);
  const [noteDrafts, setNoteDrafts] = useState({});

  const stats = useMemo(() => {
    const totalPending = requests.filter((request) => request.status === "Pending").length;
    const totalApproved = requests.filter((request) => request.status === "Approved").length;
    const totalRejected = requests.filter((request) => request.status === "Rejected").length;
    const totalValue = requests
      .filter((request) => request.status === "Pending")
      .reduce((sum, request) => sum + request.amount, 0);
    return {
      totalPending,
      totalApproved,
      totalRejected,
      totalValue,
    };
  }, [requests]);

  const pendingRequests = useMemo(() => {
    return requests.filter((request) => request.status === "Pending");
  }, [requests]);

  const handleNoteChange = (id, note) => {
    setNoteDrafts((prev) => ({
      ...prev,
      [id]: note,
    }));
  };

  const handleDecision = (id, decision) => {
    const target = requests.find((request) => request.id === id);
    const note = (noteDrafts[id] || "").trim();
    if (target) {
      storeHistoryRecord({
        id: target.id,
        type: target.type,
        decisionBy: DECISION_OWNER,
        decidedAt: new Date().toISOString(),
        amount: target.amount,
        status: decision,
        notes: note.length ? note : "—",
      });
    }

    setRequests((prev) =>
      prev.map((request) =>
        request.id === id
          ? {
              ...request,
              status: decision,
            }
          : request
      )
    );

    setNoteDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  return (
    <FinanceLayout title="Pending Payment Approvals" showNavigation={false}>
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-amber-700">Pending</p>
            <p className="mt-3 text-3xl font-semibold text-amber-700">{stats.totalPending}</p>
            <p className="text-sm text-amber-600">Awaiting action</p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-emerald-700">Approved</p>
            <p className="mt-3 text-3xl font-semibold text-emerald-700">{stats.totalApproved}</p>
            <p className="text-sm text-emerald-600">Completed this cycle</p>
          </div>
          <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-rose-700">Rejected</p>
            <p className="mt-3 text-3xl font-semibold text-rose-700">{stats.totalRejected}</p>
            <p className="text-sm text-rose-600">Returned to requesters</p>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-blue-700">Pending Value</p>
            <p className="mt-3 text-2xl font-semibold text-blue-700">{currencyFormatter.format(stats.totalValue)}</p>
            <p className="text-sm text-blue-600">Requires budget allocation</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Queue</h2>
          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
              <thead className="bg-blue-100 text-blue-900">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Request</th>
                  <th className="px-4 py-3 text-left font-semibold">Requester</th>
                  <th className="px-4 py-3 text-left font-semibold">Submitted</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th className="px-4 py-3 text-center font-semibold">Priority</th>
                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                  <th className="px-4 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {pendingRequests.length ? (
                  pendingRequests.map((request) => (
                    <tr key={request.id} className="transition hover:bg-blue-50/60">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        <div className="flex flex-col">
                          <span>{request.id}</span>
                          <span className="text-xs text-slate-500">{request.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{request.requester}</td>
                      <td className="px-4 py-3">{formatDateTime(request.submitted)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-700">
                        {currencyFormatter.format(request.amount)}
                      </td>
                      <td className={`px-4 py-3 text-center font-medium ${getPriorityTone(request.priority)}`}>
                        {request.priority}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusTone(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-stretch gap-3">
                          <textarea
                            rows={2}
                            value={noteDrafts[request.id] || ""}
                            onChange={(event) => handleNoteChange(request.id, event.target.value)}
                            placeholder="Add note for history log"
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-300"
                          />
                          <div className="flex justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleDecision(request.id, "Approved")}
                              className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDecision(request.id, "Rejected")}
                              className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-700"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm text-slate-500" colSpan={7}>
                      All pending approvals are processed.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </FinanceLayout>
  );
}

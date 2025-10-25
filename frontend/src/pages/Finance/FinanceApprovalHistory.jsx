import React, { useEffect, useMemo, useState } from "react";
import FinanceLayout from "./FinanceLayout";

const HISTORY_STORAGE_KEY = "financeApprovalHistory";

const baseHistoryRecords = [
  {
    id: "REQ-1031",
    type: "Supplier Payment",
    decisionBy: "Finance Director",
    decidedAt: "2025-10-24T09:50:00Z",
    amount: 152000,
    status: "Approved",
    notes: "Matched to PO-5521 and receiving report.",
  },
  {
    id: "REQ-1027",
    type: "Expense Reimbursement",
    decisionBy: "Controller",
    decidedAt: "2025-10-23T14:20:00Z",
    amount: 9800,
    status: "Approved",
    notes: "Receipts verified and coded to marketing events.",
  },
  {
    id: "REQ-1035",
    type: "Capital Expenditure",
    decisionBy: "CFO",
    decidedAt: "2025-10-22T17:05:00Z",
    amount: 320000,
    status: "Rejected",
    notes: "Pending revised ROI analysis and executive sign-off.",
  },
  {
    id: "REQ-1022",
    type: "Subscription Renewal",
    decisionBy: "Finance Manager",
    decidedAt: "2025-10-22T08:15:00Z",
    amount: 54000,
    status: "Approved",
    notes: "Renewal aligned with IT asset roadmap.",
  },
  {
    id: "REQ-1018",
    type: "Invoice Adjustment",
    decisionBy: "Finance Director",
    decidedAt: "2025-10-21T10:10:00Z",
    amount: 18750,
    status: "Approved",
    notes: "Credit memo issued and applied to customer ledger.",
  },
  {
    id: "REQ-1015",
    type: "Supplier Payment",
    decisionBy: "CFO",
    decidedAt: "2025-10-19T12:40:00Z",
    amount: 268000,
    status: "Rejected",
    notes: "Pricing variance under dispute with vendor.",
  },
];

const statusFilters = [
  { id: "all", label: "All" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

const getStatusTone = (status) => {
  const normalized = status.toLowerCase();
  if (normalized === "approved") return "bg-emerald-100 text-emerald-700";
  if (normalized === "rejected") return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-700";
};

const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

export default function FinanceApprovalHistory() {
  const [filter, setFilter] = useState("all");
  const [storedHistory, setStoredHistory] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loadHistory = () => {
      try {
        const existing = window.localStorage.getItem(HISTORY_STORAGE_KEY);
        const parsed = existing ? JSON.parse(existing) : [];
        setStoredHistory(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        setStoredHistory([]);
      }
    };

    loadHistory();

    const handleStorage = (event) => {
      if (event.key === HISTORY_STORAGE_KEY) {
        loadHistory();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const combinedHistory = useMemo(() => {
    const merged = [...storedHistory, ...baseHistoryRecords];
    return merged.sort((a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime());
  }, [storedHistory]);

  const filteredHistory = useMemo(() => {
    if (filter === "all") return combinedHistory;
    return combinedHistory.filter((record) => record.status.toLowerCase() === filter);
  }, [combinedHistory, filter]);

  const metrics = useMemo(() => {
    const totalApproved = combinedHistory.filter((record) => record.status === "Approved").length;
    const totalRejected = combinedHistory.filter((record) => record.status === "Rejected").length;
    const cycleTime = 5.8;
    return {
      totalApproved,
      totalRejected,
      cycleTime,
    };
  }, [combinedHistory]);

  return (
    <FinanceLayout title="Approval History" showNavigation={false}>
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-emerald-700">Approvals</p>
            <p className="mt-3 text-3xl font-semibold text-emerald-700">{metrics.totalApproved}</p>
            <p className="text-sm text-emerald-600">Completed decisions</p>
          </div>
          <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-rose-700">Rejections</p>
            <p className="mt-3 text-3xl font-semibold text-rose-700">{metrics.totalRejected}</p>
            <p className="text-sm text-rose-600">Items requiring revision</p>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-blue-700">Average Cycle Time</p>
            <p className="mt-3 text-3xl font-semibold text-blue-700">{metrics.cycleTime} hrs</p>
            <p className="text-sm text-blue-600">Submission to decision</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Decision Log</h2>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setFilter(option.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === option.id
                    ? "bg-blue-600 text-white shadow"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
              <thead className="bg-blue-100 text-blue-900">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Request</th>
                  <th className="px-4 py-3 text-left font-semibold">Decision By</th>
                  <th className="px-4 py-3 text-left font-semibold">Decided At</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredHistory.length ? (
                  filteredHistory.map((record) => (
                    <tr key={`${record.id}-${record.decidedAt}`} className="transition hover:bg-blue-50/60">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        <div className="flex flex-col">
                          <span>{record.id}</span>
                          <span className="text-xs text-slate-500">{record.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{record.decisionBy}</td>
                      <td className="px-4 py-3">{formatDateTime(record.decidedAt)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-700">
                        {currencyFormatter.format(record.amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusTone(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{record.notes && record.notes.trim() ? record.notes : "—"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm text-slate-500" colSpan={6}>
                      No records match the selected filter.
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

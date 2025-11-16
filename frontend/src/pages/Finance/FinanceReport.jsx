import React from "react";

const coreCapabilities = [
  {
    title: "General Ledger Management",
    description:
      "Centralizes journal entries and consolidates activity from purchasing, inventory, payroll, and sales modules for real-time visibility.",
  },
  {
    title: "Accounts Payable",
    description:
      "Tracks supplier obligations from invoice intake through payment, ensuring compliant disbursement cycles and vendor transparency.",
  },
  {
    title: "Accounts Receivable",
    description:
      "Monitors customer billing, receipts, and outstanding balances to accelerate collections and maintain healthy cash flow.",
  },
  {
    title: "Financial Reporting and Compliance",
    description:
      "Generates statements, variance analyses, and regulatory filings to keep leadership and auditors aligned on performance.",
  },
];

const implementationChecklist = [
  {
    title: "General Ledger",
    items: [
      "Record journal entries (debits and credits)",
      "Maintain a structured chart of accounts",
      "Produce trial balances and core financial statements",
      "Deliver real-time consolidated dashboards",
    ],
  },
  {
    title: "Accounts Payable",
    items: [
      "Capture supplier invoices with purchase order linkage",
      "Match invoices against PO and receiving records",
      "Track aging, due dates, and approval workflows",
      "Process payments with remittance documentation",
    ],
  },
  {
    title: "Accounts Receivable",
    items: [
      "Generate customer invoices from sales orders",
      "Post receipts and allocate to outstanding invoices",
      "Monitor balances with aging analysis",
      "Automate reminder and dunning schedules",
    ],
  },
  {
    title: "Reporting and Compliance",
    items: [
      "Publish income statement, balance sheet, and cash flow",
      "Compare budget versus actual performance",
      "Automate tax calculations and reporting packages",
    ],
  },
];

export default function FinanceReport() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-700 mb-2">Reports and Compliance</h1>
        <p className="text-lg text-slate-600">Financial reporting and regulatory compliance management</p>
      </div>
      <div className="bg-white shadow-lg rounded-xl p-6 overflow-x-auto">
        <div className="space-y-10">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Module Snapshot</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {coreCapabilities.map((capability) => (
                <div
                  key={capability.title}
                  className="h-full rounded-xl border border-blue-100 bg-blue-50/70 p-5 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-blue-700">{capability.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">{capability.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Implementation Checklist</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              {implementationChecklist.map((group) => (
                <div
                  key={group.title}
                  className="h-full rounded-xl border border-slate-200 bg-white/90 p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold text-blue-700">{group.title}</h3>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                      {group.items.length} Tasks
                    </span>
                  </div>
                  <ul className="mt-4 space-y-3 text-sm text-slate-700">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-blue-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

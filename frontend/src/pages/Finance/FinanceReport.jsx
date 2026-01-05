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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Reports and Compliance</h2>
            <p className="text-white/80 text-sm">Financial reporting and regulatory compliance management</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Finance Module Overview</h3>
              <p className="text-white/80 text-sm">Comprehensive financial management capabilities</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-10">
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-2 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Module Snapshot</h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {coreCapabilities.map((capability) => (
                  <div
                    key={capability.title}
                    className="h-full rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-200"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-2 shadow-md">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-blue-700">{capability.title}</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-700">{capability.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-2 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Implementation Checklist</h2>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                {implementationChecklist.map((group) => (
                  <div
                    key={group.title}
                    className="h-full rounded-2xl border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-purple-200"
                  >
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-2 shadow-md">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-purple-700">{group.title}</h3>
                      </div>
                      <span className="rounded-full bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 px-3 py-1 text-xs font-bold uppercase tracking-wide text-purple-700 shadow-sm">
                        {group.items.length} Tasks
                      </span>
                    </div>
                    <ul className="space-y-3 text-sm text-gray-700">
                      {group.items.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 shadow-sm" />
                          <span className="leading-relaxed">{item}</span>
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
    </div>
  );
}
import React, { useState } from "react";

export default function FinanceLayout({ title, children, showNavigation = true }) {
  const [isApprovalsOpen, setIsApprovalsOpen] = useState(false);
  const financeLinks = [
    ["General Ledger", "/finance/general-finance"],
    ["Accounts Payable (Supplier)", "/finance/supplier-report"],
    ["Accounts Receivable (Customer)", "/finance/customer-report"],
    ["Reports and Compliance", "/finance/finance-report"],
    ["Employee Payroll (HR)", "/finance/employee-payroll"],
    ["Inventory Report", "/finance/inventory-report"],
  ];
  const approvalLinks = [
    ["Approvals Overview", "/finance/approvals/overview"],
    ["Pending Payments", "/finance/approvals/pending"],
    ["Transaction Approval History", "/finance/approvals/history"],
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">{title}</h1>

      {showNavigation ? (
        <nav className="flex flex-wrap justify-center gap-6 text-blue-700 mb-8">
          {financeLinks.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="inline-flex items-center px-4 py-2 text-sm font-medium transition-colors hover:text-blue-900 hover:underline"
            >
              {label}
            </a>
          ))}
          <div className="relative" onMouseLeave={() => setIsApprovalsOpen(false)}>
            <button
              type="button"
              onClick={() => setIsApprovalsOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:text-blue-900 hover:underline focus:outline-none"
            >
              Approvals
              <span className="text-xs">{isApprovalsOpen ? "▴" : "▾"}</span>
            </button>
            {isApprovalsOpen ? (
              <div className="absolute left-0 z-10 mt-2 w-56 rounded-lg border border-blue-100 bg-white shadow-lg">
                {approvalLinks.map(([label, href]) => (
                  <a
                    key={href}
                    href={href}
                    className="block px-4 py-2 text-sm text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-900"
                    onClick={() => setIsApprovalsOpen(false)}
                  >
                    {label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </nav>
      ) : null}

      <div className="bg-white shadow rounded-lg p-5 overflow-x-auto">{children}</div>
    </div>
  );
}

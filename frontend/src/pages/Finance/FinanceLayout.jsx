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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">{title}</h2>
            <p className="text-white/80 text-sm">Comprehensive financial management system</p>
          </div>
        </div>
      </div>

      {showNavigation ? (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-2 border-gray-100 hover:border-indigo-200 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-2 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800">Finance Navigation</h3>
          </div>
          
          <nav className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {financeLinks.map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="group flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg"
              >
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-2 shadow-md group-hover:shadow-lg transition-all duration-300">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-700 group-hover:text-indigo-700 transition-colors duration-300">{label}</span>
              </a>
            ))}
            
            <div className="relative group" onMouseLeave={() => setIsApprovalsOpen(false)}>
              <button
                type="button"
                onClick={() => setIsApprovalsOpen((prev) => !prev)}
                className="w-full flex items-center justify-between gap-3 p-4 rounded-xl border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-purple-50 hover:from-purple-50 hover:to-pink-50 hover:border-purple-300 transition-all duration-300 hover:shadow-lg focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-2 shadow-md group-hover:shadow-lg transition-all duration-300">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-700 group-hover:text-purple-700 transition-colors duration-300">Approvals</span>
                </div>
                <span className="text-purple-600 font-bold">{isApprovalsOpen ? "▴" : "▾"}</span>
              </button>
              
              {isApprovalsOpen ? (
                <div className="absolute left-0 right-0 z-10 mt-2 rounded-xl border-2 border-purple-100 bg-white shadow-xl overflow-hidden">
                  {approvalLinks.map(([label, href]) => (
                    <a
                      key={href}
                      href={href}
                      className="block px-4 py-3 text-sm font-medium text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-900 transition-all duration-200 border-b border-purple-50 last:border-b-0"
                      onClick={() => setIsApprovalsOpen(false)}
                    >
                      {label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </nav>
        </div>
      ) : null}

      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 overflow-hidden">{children}</div>
    </div>
  );
}

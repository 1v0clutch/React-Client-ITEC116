import React from "react";

export default function FinanceLayout({ title, children }) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">{title}</h1>

      {/* Navigation */}
      <nav className="flex flex-wrap justify-center gap-6 text-blue-700 mb-8">
        {[
          ["General Ledger", "/finance/general-finance"],
          ["Accounts Payable (Supplier)", "/finance/supplier-report"],
          ["Accounts Receivable (Customer)", "/finance/customer-report"],
          ["Reports and Compliance", "/finance/finance-report"],
          ["Employee Payroll (HR)", "/finance/employee-payroll"],
          ["Inventory Report", "/finance/inventory-report"],
        ].map(([label, href]) => (
          <a
            key={href}
            href={href}
            className="hover:text-blue-900 hover:underline transition-colors"
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="bg-white shadow rounded-lg p-5 overflow-x-auto">{children}</div>
    </div>
  );
}

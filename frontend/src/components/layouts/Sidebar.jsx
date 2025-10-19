// src/components/layouts/Sidebar.js
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const categories = [
  {
    label: "Customer Service",
    links: [
      { path: "/customer-service", label: "Helpdesk" }
    ]
  },
  {
    label: "Sales",
    links: [
      { path: "/sales/customer-management", label: "Customer Management" },
      { path: "/sales/after-sales", label: "After Sales" },
      { path: "/sales/sales-order", label: "Orders" },
      { path: "/sales/sales-report", label: "Reports" },
    ]
  },
  {
    label: "Procurement",
    links: [
      { path: "/procurement", label: "Procurement Home" },
      { path: "/procurement/suppliers", label: "Suppliers" },
      { path: "/procurement/requisition", label: "Requisition" },
      { path: "/procurement/purchase-orders", label: "Purchase Orders" },
      { path: "/procurement/invoices", label: "Invoices" },
    ],
  },
  {
    label: "Inventory",
    links: [
      { path: "/inventory", label: "Inventory" },
      { path: "/transactions", label: "Transactions" },
      { path: "/warehouse", label: "Warehouse" },
    ],
  },
  {
    label: "Finance",
    links: [
      { path: "/finance/general-finance", label: "General Finance" },
      { path: "/finance/employee-payroll", label: "Employee Payroll" },
      { path: "/finance/supplier-report", label: "Supplier Report" },
      { path: "/finance/customer-report", label: "Customer Report" },
      { path: "/finance/finance-report", label: "Finance Report" },
      { path: "/finance/inventory-report", label: "Inventory Report" },
    ],
  },
  {
    label: "HR",
    links: [
      { path: "/hr/attendance", label: "Attendance" },
      { path: "/hr/dashboard", label: "Dashboard" },
      { path: "/hr/departments", label: "Departments" },
      { path: "/hr/employees", label: "Employees" },
      { path: "/hr/leaves", label: "Leaves" },
      { path: "/hr/payroll-employee", label: "Payroll" },
      { path: "/hr/salary", label: "Salary" },

    ],
  },
{
   label: "Report",
    links: [
      { path: "/report", label: "Reports" },
      
    ]
}
];

function Sidebar() {
  const location = useLocation();
  const [openCategories, setOpenCategories] = useState([]);

  const toggleCategory = (label) => {
    setOpenCategories((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );
  };

  return (
    <nav className="fixed left-0 top-0 h-screen w-56 bg-[#222e3c] text-white overflow-y-auto z-50">
      <h2 className="m-5 text-center mb-5 text-lg font-bold">EMS Navigation</h2>

      {categories.map((cat) => {
        const isOpen = openCategories.includes(cat.label);
        return (
          <div key={cat.label}>
            {/* Category Header */}
            <div
              onClick={() => toggleCategory(cat.label)}
              className="flex justify-between items-center px-5 py-3 bg-[#2c3a4b] font-semibold cursor-pointer hover:bg-[#3a4a5c] select-none"
            >
              <span>{cat.label}</span>
              <span>{isOpen ? "▾" : "▸"}</span>
            </div>

            {/* Links */}
            <div
              className={`transition-all duration-300 ease-in-out ${
                isOpen ? "max-h-[500px]" : "max-h-0 overflow-hidden"
              }`}
            >
              {cat.links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-9 py-2 text-sm hover:bg-[#1a2230] transition ${
                    location.pathname === link.path
                      ? "bg-[#1a2230] font-semibold"
                      : ""
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

export default Sidebar;

// src/components/layouts/Sidebar.js
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const categories = [
  {
    label: "Customer Service",
    links: [{ path: "/customer-service", label: "Helpdesk" }],
  },
  {
    label: "Sales",
    links: [
      { path: "/sales/customer-management", label: "Customer Management" },
      { path: "/sales/after-sales", label: "After Sales" },
      { path: "/sales/sales-order", label: "Orders" },
      { path: "/sales/sales-report", label: "Reports" },
    ],
  },
  {
    label: "Procurement",
    links: [
      { path: "/procurement/suppliers", label: "Suppliers" },
      { path: "/procurement/requisition", label: "Requisition" },
      { path: "/procurement/purchase-orders", label: "Purchase Orders" },
      { path: "/procurement/invoices", label: "Invoices" },
    ],
  },
  {
    label: "Inventory",
    links: [
      { path: "/inventory/inventory-management", label: "Inventory" },
      { path: "/inventory/transactions", label: "Transactions" },
      { path: "/inventory/warehouse", label: "Warehouse" },
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
      {
        label: "Approvals",
        children: [
          { path: "/finance/approvals/overview", label: "Overview" },
          { path: "/finance/approvals/pending", label: "Pending Approvals" },
          { path: "/finance/approvals/history", label: "Approval History" },
        ],
      },
    ],
  },
  {
    label: "HR",
    links: [
      { path: "/hr/attendance", label: "Attendance" },
      { path: "/hr/dashboard", label: "Dashboard" },
      { path: "/hr/departments", label: "Departments" },
      { path: "/hr/employees", label: "Employees" },
      { path: "/hr/payroll-employee", label: "Payroll" },
      { path: "/hr/salary", label: "Salary" },
    ],
  },
  {
    label: "Reports & BI",
    links: [
      { path: "/report", label: "Business Intelligence" },
    ],
  },
  {
    label: "SupplyChain",
    links: [
      { path: "/supply-chain/demand-forecast", label: "Demand Forecast" },
      { path: "/supply-chain/inventory-supply-chain", label: "Inventory Supply Chain" },
      { path: "/supply-chain/logistics-supply-chain", label: "Logisctics Supply Chain" },
      { path: "/supply-chain/procurement-supply-chain", label: "Procurement Supply Chain" },
    ],
  },
  {
    label: "Project Management",
    links: [{ path: "/project-management/project", label: "Project" }],
  },
];

function Sidebar() {
  const location = useLocation();
  const [openCategories, setOpenCategories] = useState([]);
  const [openSubmenus, setOpenSubmenus] = useState([]);

  const toggleCategory = (label) => {
    setOpenCategories((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );
  };

  const toggleSubmenu = (id) => {
    setOpenSubmenus((prev) =>
      prev.includes(id) ? prev.filter((key) => key !== id) : [...prev, id]
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
              {cat.links.map((link) => {
                if (link.children) {
                  const submenuId = `${cat.label}-${link.label}`;
                  const childActive = link.children.some((child) => child.path === location.pathname);
                  const isStoredOpen = openSubmenus.includes(submenuId);
                  const isSubmenuOpen = isStoredOpen || childActive;
                  return (
                    <div key={submenuId}>
                      <button
                        type="button"
                        onClick={() => toggleSubmenu(submenuId)}
                        className={`flex w-full items-center justify-between px-9 py-2 text-sm hover:bg-[#1a2230] transition ${
                          childActive ? "bg-[#1a2230] font-semibold" : ""
                        }`}
                      >
                        <span>{link.label}</span>
                        <span>{isSubmenuOpen ? "▾" : "▸"}</span>
                      </button>
                      <div
                        className={`transition-all duration-300 ease-in-out ${
                          isSubmenuOpen ? "max-h-[400px]" : "max-h-0 overflow-hidden"
                        }`}
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={`block px-12 py-2 text-sm hover:bg-[#151c29] transition ${
                              location.pathname === child.path
                                ? "bg-[#151c29] font-semibold"
                                : ""
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
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
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

export default Sidebar;

import React, { useEffect, useState } from "react";
import Sidebar from "./components/layouts/Sidebar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Procurement from "./pages/Dashboard/Procurement";
import Suppliers from "./pages/Procurement/Suppliers";
import Requisition from "./pages/Procurement/Requisition";
import PurchaseOrders from "./pages/Procurement/PurchaseOrders";
import Invoices from "./pages/Procurement/Invoices";

import Inventory from "./pages/Dashboard/Inventory";
import Transaction from "./pages/Dashboard/Transaction";
import Warehouse from "./pages/Dashboard/Warehouse";

import Finance from "./pages/Finance/FinanceHead";
import Payroll from "./pages/Finance/EmployeePayroll";
import Supplier from "./pages/Finance/SupplierReport";
import Customer from "./pages/Finance/CustomerReport";
import Report from "./pages/Finance/FinanceReport";
import InventoryReport from "./pages/Finance/InventoryReport";


import Attendance from "./pages/HR/Attendance";
import Dashboard from "./pages/HR/Dashboard";
import Departments from "./pages/HR/Departments";
import Employees from "./pages/HR/Employees";
import Leaves from "./pages/HR/Leaves";
import PayrollEmployee from "./pages/HR/Payroll";
import Salary from "./pages/HR/Salary";

function App() {
  const loadData = () => {
    const saved = localStorage.getItem("ems_data_v1");
    return saved
      ? JSON.parse(saved)
      : {
          employees: [],
          departments: [],
          leaves: [],
          payroll: [],
          salary: [],
        };
  };
  const [data, setData] = useState(loadData);

  useEffect(() => {
    localStorage.setItem("ems_data_v1", JSON.stringify(data));
  }, [data]);
  

   return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="ml-56 p-5 w-full bg-gray-50 min-h-screen">
          <Routes>
            {/* Procurement */}
            <Route path="/procurement" element={<Procurement />} />
            <Route path="/procurement/suppliers" element={<Suppliers />} />
            <Route path="/procurement/requisition" element={<Requisition />} />
            <Route path="/procurement/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/procurement/invoices" element={<Invoices />} />

            {/* Inventory */}
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/transactions" element={<Transaction />} />
            <Route path="/warehouse" element={<Warehouse />} />

            {/* Finance */}
            <Route path="/finance/general-finance" element={<Finance />} />
            <Route path="/finance/employee-payroll" element={<Payroll />} />
            <Route path="/finance/supplier-report" element={<Supplier />} />
            <Route path="/finance/customer-report" element={<Customer />} />
            <Route path="/finance/finance-report" element={<Report />} />
            <Route path="/finance/inventory-report" element={<InventoryReport />} />

            {/* HR */}
            <Route path="/hr/attendance" element={<Attendance data={data} setData={setData} />} />
            <Route path="/hr/dashboard" element={<Dashboard data={data} setData={setData} />} />
            <Route path="/hr/departments" element={<Departments data={data} setData={setData} />} />
            <Route path="/hr/employees" element={<Employees data={data} setData={setData} />} />
            <Route path="/hr/leaves" element={<Leaves data={data} setData={setData} />} />
            <Route path="/hr/payroll-employee" element={<PayrollEmployee data={data} setData={setData} />} />
            <Route path="/hr/salary" element={<Salary data={data} setData={setData} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
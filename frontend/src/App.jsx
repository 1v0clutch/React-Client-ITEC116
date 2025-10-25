import React, { useEffect, useState } from "react";
import Sidebar from "./components/layouts/Sidebar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Procurement
import Suppliers from "./pages/Procurement/Suppliers";
import Requisition from "./pages/Procurement/Requisition";
import PurchaseOrders from "./pages/Procurement/PurchaseOrders";
import Invoices from "./pages/Procurement/Invoices";

// Inventory
import Inventory from "./pages/Inventory/Inventory";
import Transaction from "./pages/Inventory/Transaction";
import Warehouse from "./pages/Inventory/Warehouse";

// Finance
import Finance from "./pages/Finance/FinanceHead";
import Payroll from "./pages/Finance/EmployeePayrollReport";
import SupplierReport from "./pages/Finance/SupplierReport";
import Customer from "./pages/Finance/CustomerReport";
import Report from "./pages/Finance/FinanceReport";
import InventoryReport from "./pages/Finance/InventoryReport";
import EmployeePayrollReport from "./pages/Finance/EmployeePayrollReport";
import FinanceApprovalsOverview from "./pages/Finance/FinanceApprovalsOverview";
import FinancePendingApprovals from "./pages/Finance/FinancePendingApprovals";
import FinanceApprovalHistory from "./pages/Finance/FinanceApprovalHistory";

// HR //
import Attendance from "./pages/HR/Attendance";
import Dashboard from "./pages/HR/Dashboard";
import Departments from "./pages/HR/Departments";
import Employees from "./pages/HR/Employees";
import PayrollEmployee from "./pages/HR/Payroll";
import Salary from "./pages/HR/Salary";

// Customer Service
import CustomerService from "./pages/Customer Service/CustomerService";

// Sales
import AfterSales from "./pages/SalesCustomer/AfterSales";
import CMmanagement from "./pages/SalesCustomer/CMmanagement";
import SalesOrder from "./pages/SalesCustomer/Salesorder";
import SalesReport from "./pages/SalesCustomer/salerep";

// SupplyChain
import DemandForecast from "./pages/SupplyChain/DemandForecast";
import InventorySupplyChain from "./pages/SupplyChain/InventorySupplyChain";
import LogisticsSupplyChain from "./pages/SupplyChain/LogisticsSupplyChain";
import ProcurementSupplyChain from "./pages/SupplyChain/ProcurementSupplyChain";

// Project Management
import Project from "./pages/ProjectManagement/Project";
import ProjectForm from "./pages/ProjectManagement/ProjectForm";
import ProjectGantt from "./pages/ProjectManagement/ProjectGantt";
import DependencySetup from "./pages/ProjectManagement/DependencySetup";
import Employee from "./pages/ProjectManagement/Employee";
{
  /* This is a temporary form */
}
const API_BASE = "http://localhost:5000/api";

function App() {
  const [data, setData] = useState({
    employees: [],
    departments: [],
    attendance: [],
    payroll: [],
    salary: [],
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [
          employeesRes,
          departmentsRes,
          attendanceRes,
          payrollRes,
          salaryRes,
        ] = await Promise.all([
          fetch(`${API_BASE}/employees`),
          fetch(`${API_BASE}/departments`),
          fetch(`${API_BASE}/attendance`),
          fetch(`${API_BASE}/payroll`),
          fetch(`${API_BASE}/salary`),
        ]);

        const [employees, departments, attendance, payroll, salary] =
          await Promise.all([
            employeesRes.json(),
            departmentsRes.json(),
            attendanceRes.json(),
            payrollRes.json(),
            salaryRes.json(),
          ]);

        setData({ employees, departments, attendance, payroll, salary });
      } catch (error) {
        console.error("❌ Failed to load data:", error);
      }
    };

    fetchAll();
  }, []);

  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="ml-56 p-5 w-full bg-gray-50 min-h-screen">
          <Routes>
            {/* Procurement */}
            <Route path="/procurement/suppliers" element={<Suppliers />} />
            <Route path="/procurement/requisition" element={<Requisition />} />
            <Route
              path="/procurement/purchase-orders"
              element={<PurchaseOrders />}
            />
            <Route path="/procurement/invoices" element={<Invoices />} />

            {/* Inventory */}
            <Route
              path="/inventory/inventory-management"
              element={<Inventory />}
            />
            <Route path="/inventory/transactions" element={<Transaction />} />
            <Route path="/inventory/warehouse" element={<Warehouse />} />

            {/* Finance */}
            <Route path="/finance/general-finance" element={<Finance />} />
            <Route path="/finance/employee-payroll" element={<Payroll />} />
            <Route
              path="/finance/supplier-report"
              element={<SupplierReport />}
            />
            <Route path="/finance/customer-report" element={<Customer />} />
            <Route path="/finance/finance-report" element={<Report />} />
            <Route
              path="/finance/inventory-report"
              element={<InventoryReport />}
            />
            <Route
              path="/finance/payroll-report"
              element={<EmployeePayrollReport />}
            />
            <Route
              path="/finance/approvals/overview"
              element={<FinanceApprovalsOverview />}
            />
            <Route
              path="/finance/approvals/pending"
              element={<FinancePendingApprovals />}
            />
            <Route
              path="/finance/approvals/history"
              element={<FinanceApprovalHistory />}
            />

            {/* HR */}
            <Route
              path="/hr/attendance"
              element={<Attendance data={data} setData={setData} />}
            />
            <Route
              path="/hr/dashboard"
              element={<Dashboard data={data} setData={setData} />}
            />
            <Route
              path="/hr/departments"
              element={<Departments data={data} setData={setData} />}
            />
            <Route
              path="/hr/employees"
              element={<Employees data={data} setData={setData} />}
            />
            <Route
              path="/hr/payroll-employee"
              element={<PayrollEmployee data={data} setData={setData} />}
            />
            <Route
              path="/hr/salary"
              element={<Salary data={data} setData={setData} />}
            />

            {/* Customer Service */}
            <Route path="/customer-service" element={<CustomerService />} />

            {/* Sales */}
            <Route
              path="/sales/customer-management"
              element={<CMmanagement />}
            />
            <Route path="/sales/after-sales" element={<AfterSales />} />
            <Route path="/sales/sales-order" element={<SalesOrder />} />
            <Route path="/sales/sales-report" element={<SalesReport />} />

            {/* SupplyChain */}
            <Route path="/supply-chain/demand-forecast" element={<DemandForecast />} />
            <Route path="/supply-chain/procurement-supply-chain" element={<ProcurementSupplyChain />} />
            <Route path="/supply-chain/logistics-supply-chain" element={<LogisticsSupplyChain />} />
            <Route path="/supply-chain/inventory-supply-chain" element={<InventorySupplyChain />} />

            {/* Project Management */}
            <Route path="/project-management/project" element={<Project />} />
            <Route path="/project-management/form" element={<ProjectForm />} />
            <Route
              path="/project-management/gantt/:id"
              element={<ProjectGantt />}
            />
            <Route
              path="/project-management/dependencies-setup"
              element={<DependencySetup />}
            />
            <Route path="/project-management/employee" element={<Employee />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

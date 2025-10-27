require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

//Import Routes
// =============================
// ROUTE IMPORTS
// =============================
const inventoryRoutes = require("./routes/inventory.routes");
const transactionRoutes = require("./routes/transaction.routes");
const warehouseRoutes = require("./routes/warehouse.routes");
const supplierRoutes = require("./routes/supplier.routes");
const requisitionRoutes = require("./routes/requisition.routes");
const purchaseOrderRoutes = require("./routes/purchaseOrder.routes");
const invoiceRoutes = require("./routes/invoice.routes");
const financeRoutes = require("./routes/finance.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const leaveRoutes = require("./routes/leave.routes");
const hrRoutes = require("./routes/hr.routes");
const demandForecastRoutes = require("./routes/demandForecast.routes");
const logisticsRoutes = require("./routes/logistics.routes");
const procurementRoutes = require("./routes/procurement.routes");
const projectRoutes = require("./routes/project.routes");
const employeeRoutes = require("./routes/employee.routes"); //
const projectBudgetRoutes = require("./routes/projectBudget.routes");
const salesOrderRoutes = require("./routes/salesOrder.routes");
const quotationRoutes = require("./routes/quotation.routes");

//Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// =============================
// CONNECT TO DATABASE
// =============================
connectDB();

// =============================
// ROUTES
// =============================

// ✅ HR Core Routes
//app.use("/api/hr", hrRoutes);
//app.use("/api/employees", employeesRoutes);
//app.use("/api/departments", departmentsRoutes);
//app.use("/api/salary", salaryRoutes);
//app.use("/api/payroll", payrollRoutes);

// ✅ HR Submodules
//app.use("/api/attendance", attendanceRoutes);
//app.use("/api/leaves", leaveRoutes);
//app.use("/api/payroll", payrollRoutes);
//app.use("/api/salary", salaryRoutes);

// ✅ Procurement & Inventory
app.use("/api/inventory", inventoryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/requisitions", requisitionRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/demandForecast", demandForecastRoutes);
app.use("/api/logistics", logisticsRoutes);
app.use("/api/procurement", require("./routes/procurement.routes"));
app.use("/api/project", projectRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/projectBudget", projectBudgetRoutes);
app.use("/api/sales-orders", salesOrderRoutes);
app.use("/api/quotations", quotationRoutes);

// ✅ Finance
app.use("/api/finance", financeRoutes);

// =============================
// DEFAULT ROUTE
// =============================
app.get("/", (req, res) => {
  res.send("✅ API is running successfully...");
});

// =============================
// START SERVER
// =============================
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

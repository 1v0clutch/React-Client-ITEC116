require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

//Import Routes
const inventoryRoutes = require("./routes/inventory.routes");
const transactionRoutes = require("./routes/transaction.routes");
const warehouseRoutes = require("./routes/warehouse.routes");
const supplierRoutes = require("./routes/supplier.routes");
const requisitionRoutes = require("./routes/requisition.routes");
const purchaseOrderRoutes = require("./routes/purchaseOrder.routes");
const invoiceRoutes = require("./routes/invoice.routes");
const financeRoutes = require("./routes/finance");

const app = express();

//Middleware
app.use(
    cors({
        origin: process.env.CLIENT_URL || "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json());

//Connect to Database
connectDB();

//Routes
app.use("/api/inventory", inventoryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/requisitions", requisitionRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/finance", financeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
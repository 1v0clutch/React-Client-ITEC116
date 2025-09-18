require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const supplierRoutes = require("./routes/supplier.routes");
const requisitionRoutes = require("./routes/requisition.routes");
const purchaseOrderRoutes = require("./routes/purchaseOrder.routes");
const invoiceRoutes = require("./routes/invoice.routes");

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL || "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json());

connectDB();

app.use("/api/procurement/suppliers", supplierRoutes);
app.use("/api/procurement/requisitions", requisitionRoutes);
app.use("/api/procurement/purchase-orders", purchaseOrderRoutes);
app.use("/api/procurement/invoices", invoiceRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
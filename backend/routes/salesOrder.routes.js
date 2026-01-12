const express = require("express");
const router = express.Router();
const salesOrderController = require("../controllers/salesOrder.controller");

router.post("/create", salesOrderController.createOrder);
router.get("/all", salesOrderController.getAllOrders);
router.get("/ecommerce", salesOrderController.getEcommerceOrders);
router.get("/source/:source", salesOrderController.getOrdersBySource);
router.get("/:id", salesOrderController.getOrderById);
router.put("/update/:id", salesOrderController.updateOrder);
router.delete("/delete/:id", salesOrderController.deleteOrder);
router.get("/customer/:customerId", salesOrderController.getOrdersByCustomer);
router.put("/status/:id", salesOrderController.updateOrderStatus);
router.put("/invoice-status/:id", salesOrderController.updateInvoiceStatus);

module.exports = router;

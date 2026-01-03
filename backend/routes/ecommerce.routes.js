const express = require("express");
const router = express.Router();
const ecommerceController = require("../controllers/ecommerce.controller");

// =============================
// CUSTOMER ROUTES
// =============================
router.post("/customers/create", ecommerceController.createCustomer);
router.get("/customers/all", ecommerceController.getAllCustomers);
router.get("/customers/:id", ecommerceController.getCustomerById);
router.put("/customers/update/:id", ecommerceController.updateCustomer);
router.delete("/customers/delete/:id", ecommerceController.deleteCustomer);

// =============================
// PRODUCT CATALOG ROUTES (READ FROM INVENTORY)
// =============================
router.get("/products/all", ecommerceController.getProducts);
router.get("/products/:id", ecommerceController.getProductById);
router.post("/products/validate-stock", ecommerceController.validateStock);

// =============================
// ORDER ROUTES
// =============================
router.post("/orders/create", ecommerceController.createOrder);
router.get("/orders/all", ecommerceController.getAllOrders);
router.get("/orders/:id", ecommerceController.getOrderById);
router.get("/orders/customer/:customerId", ecommerceController.getOrdersByCustomer);
router.put("/orders/status/:id", ecommerceController.updateOrderStatus);
router.put("/orders/payment/:id", ecommerceController.updatePaymentStatus);
router.put("/orders/cancel/:id", ecommerceController.cancelOrder);
router.delete("/orders/delete/:id", ecommerceController.deleteOrder);
router.delete("/orders/delete-all", ecommerceController.deleteAllOrders);

module.exports = router;

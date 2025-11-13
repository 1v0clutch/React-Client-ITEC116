const OnlineOrder = require("../models/OnlineOrder");
const Customer = require("../models/Customer");
const Inventory = require("../models/Inventory");
const SalesOrder = require("../models/SalesOrder");

// =============================
// CUSTOMER MANAGEMENT
// =============================

exports.createCustomer = async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json({ message: "Customer created successfully", customer });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json({ message: "Customer updated successfully", customer });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =============================
// PRODUCT CATALOG (READ FROM INVENTORY)
// =============================

// Get all products available for e-commerce
exports.getProducts = async (req, res) => {
  try {
    const products = await Inventory.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single product with real-time stock check (CRITICAL READ)
exports.getProductById = async (req, res) => {
  try {
    const product = await Inventory.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Validate stock availability for cart items (CRITICAL READ)
exports.validateStock = async (req, res) => {
  try {
    const { items } = req.body; // items: [{ productId, quantity }]
    
    const validationResults = [];
    
    for (const item of items) {
      const product = await Inventory.findById(item.productId);
      
      if (!product) {
        validationResults.push({
          productId: item.productId,
          available: false,
          reason: "Product not found",
        });
      } else if (product.quantity < item.quantity) {
        validationResults.push({
          productId: item.productId,
          available: false,
          reason: "Insufficient stock",
          requestedQuantity: item.quantity,
          availableQuantity: product.quantity,
        });
      } else {
        validationResults.push({
          productId: item.productId,
          available: true,
          availableQuantity: product.quantity,
        });
      }
    }
    
    const allAvailable = validationResults.every(r => r.available);
    
    res.json({
      valid: allAvailable,
      results: validationResults,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =============================
// ORDER MANAGEMENT
// =============================

// Create online order with inventory deduction (CRITICAL WRITE)
exports.createOrder = async (req, res) => {
  try {
    const { customerId, items, shippingAddress } = req.body;
    
    // Step 1: Validate customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    
    // Step 2: Validate stock availability (CRITICAL READ)
    const orderItems = [];
    let totalAmount = 0;
    
    for (const item of items) {
      const product = await Inventory.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ 
          error: `Product not found: ${item.productId}` 
        });
      }
      
      if (product.quantity < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}` 
        });
      }
      
      const unitPrice = product.price || 0;
      const subtotal = unitPrice * item.quantity;
      orderItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: unitPrice,
        subtotal: subtotal,
      });
      
      totalAmount += subtotal;
    }
    
    // Step 3: Generate order number
    const orderCount = await OnlineOrder.countDocuments();
    const orderNumber = `ORD-${Date.now()}-${orderCount + 1}`;
    
    // Step 4: Create online order
    const order = new OnlineOrder({
      customerId,
      orderNumber,
      items: orderItems,
      totalAmount,
      shippingAddress,
    });
    
    await order.save();
    
    // Step 5: Deduct inventory (CRITICAL WRITE TO MODULE 1)
    for (const item of items) {
      await Inventory.findByIdAndUpdate(
        item.productId,
        { 
          $inc: { quantity: -item.quantity },
          updatedAt: Date.now(),
        }
      );
    }
    
    // Step 6: Create corresponding Sales Order (Integration with Module 8)
    // For simplicity, create one sales order per online order
    // In production, you might want to create one per item or handle differently
    if (orderItems.length > 0) {
      const firstItem = orderItems[0];
      
      // Generate a numeric customer ID for SalesOrder (Module 8 compatibility)
      // Using timestamp + random number to ensure uniqueness
      const numericCustomerId = Date.now() % 1000000 + Math.floor(Math.random() * 1000);
      
      const salesOrder = new SalesOrder({
        customerId: numericCustomerId,
        productId: firstItem.productId,
        quantity: firstItem.quantity,
        totalAmount: totalAmount,
        status: "pending",
        invoiceStatus: "unpaid",
      });
      
      await salesOrder.save();
      
      // Link sales order to online order
      order.salesOrderId = salesOrder._id;
      await order.save();
    }
    
    res.status(201).json({ 
      message: "Order created successfully and inventory updated", 
      order 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await OnlineOrder.find()
      .populate("customerId")
      .populate("items.productId")
      .populate("salesOrderId");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await OnlineOrder.findById(req.params.id)
      .populate("customerId")
      .populate("items.productId")
      .populate("salesOrderId");
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get orders by customer
exports.getOrdersByCustomer = async (req, res) => {
  try {
    const orders = await OnlineOrder.find({ customerId: req.params.customerId })
      .populate("items.productId")
      .populate("salesOrderId");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await OnlineOrder.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    ).populate("customerId").populate("items.productId");
    
    if (!order) return res.status(404).json({ error: "Order not found" });
    
    // Update corresponding sales order status if exists
    if (order.salesOrderId) {
      await SalesOrder.findByIdAndUpdate(
        order.salesOrderId,
        { status }
      );
    }
    
    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const order = await OnlineOrder.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, updatedAt: Date.now() },
      { new: true }
    ).populate("customerId").populate("items.productId");
    
    if (!order) return res.status(404).json({ error: "Order not found" });
    
    // Update corresponding sales order invoice status if exists
    if (order.salesOrderId && paymentStatus === "paid") {
      await SalesOrder.findByIdAndUpdate(
        order.salesOrderId,
        { invoiceStatus: "paid" }
      );
    }
    
    res.json({ message: "Payment status updated", order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Cancel order and restore inventory
exports.cancelOrder = async (req, res) => {
  try {
    const order = await OnlineOrder.findById(req.params.id);
    
    if (!order) return res.status(404).json({ error: "Order not found" });
    
    if (order.status === "cancelled") {
      return res.status(400).json({ error: "Order already cancelled" });
    }
    
    // Restore inventory (CRITICAL WRITE TO MODULE 1)
    for (const item of order.items) {
      await Inventory.findByIdAndUpdate(
        item.productId,
        { 
          $inc: { quantity: item.quantity },
          updatedAt: Date.now(),
        }
      );
    }
    
    // Update order status
    order.status = "cancelled";
    order.updatedAt = Date.now();
    await order.save();
    
    // Update corresponding sales order if exists
    if (order.salesOrderId) {
      await SalesOrder.findByIdAndUpdate(
        order.salesOrderId,
        { status: "cancelled" }
      );
    }
    
    res.json({ message: "Order cancelled and inventory restored", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete order permanently (with inventory restoration)
exports.deleteOrder = async (req, res) => {
  try {
    const order = await OnlineOrder.findById(req.params.id);
    
    if (!order) return res.status(404).json({ error: "Order not found" });
    
    // Restore inventory if order wasn't cancelled (CRITICAL WRITE TO MODULE 1)
    if (order.status !== "cancelled") {
      for (const item of order.items) {
        await Inventory.findByIdAndUpdate(
          item.productId,
          { 
            $inc: { quantity: item.quantity },
            updatedAt: Date.now(),
          }
        );
      }
    }
    
    // Delete corresponding sales order if exists
    if (order.salesOrderId) {
      await SalesOrder.findByIdAndDelete(order.salesOrderId);
    }
    
    // Delete the order permanently
    await OnlineOrder.findByIdAndDelete(req.params.id);
    
    res.json({ message: "Order deleted permanently and inventory restored" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete all orders permanently (bulk operation)
exports.deleteAllOrders = async (req, res) => {
  try {
    const orders = await OnlineOrder.find();
    
    // Restore inventory for all orders
    for (const order of orders) {
      if (order.status !== "cancelled") {
        for (const item of order.items) {
          await Inventory.findByIdAndUpdate(
            item.productId,
            { 
              $inc: { quantity: item.quantity },
              updatedAt: Date.now(),
            }
          );
        }
      }
      
      // Delete corresponding sales order if exists
      if (order.salesOrderId) {
        await SalesOrder.findByIdAndDelete(order.salesOrderId);
      }
    }
    
    // Delete all orders
    const result = await OnlineOrder.deleteMany({});
    
    res.json({ 
      message: "All orders deleted permanently and inventory restored",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

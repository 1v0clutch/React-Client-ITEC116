const SalesOrder = require("../models/SalesOrder");

exports.createOrder = async (req, res) => {
  try {
    const order = new SalesOrder(req.body);
    await order.save();
    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await SalesOrder.find().populate("productId");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await SalesOrder.findById(req.params.id).populate("productId");
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const order = await SalesOrder.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("productId");
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Order updated successfully", order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await SalesOrder.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrdersByCustomer = async (req, res) => {
  try {
    const orders = await SalesOrder.find({ customerId: req.params.customerId }).populate("productId");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await SalesOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("productId");
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { invoiceStatus } = req.body;
    const order = await SalesOrder.findByIdAndUpdate(
      req.params.id,
      { invoiceStatus },
      { new: true }
    ).populate("productId");
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Invoice status updated", order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const CRMCustomer = require("../models/CRMCustomer");

exports.getCustomers = async (req, res) => {
  try {
    const customers = await CRMCustomer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const customer = new CRMCustomer({
      name: req.body.name,
      email: req.body.email,
      preference: req.body.preference || "",
      history: req.body.history || "",
      segment: req.body.segment || "Regular",
    });
    await customer.save();
    res.status(201).json({ message: "Customer created", customer });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.addLog = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Log message is required" });
    }
    const customer = await CRMCustomer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    customer.logs.push({ message });
    const savedCustomer = await customer.save();
    res.json({ message: "Log added", customer: savedCustomer });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateLog = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Log message is required" });
    }
    const customer = await CRMCustomer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    const log = customer.logs.id(req.params.logId);
    if (!log) {
      return res.status(404).json({ error: "Log not found" });
    }
    log.message = message;
    log.updatedAt = new Date();
    const savedCustomer = await customer.save();
    res.json({ message: "Log updated", customer: savedCustomer });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteLog = async (req, res) => {
  try {
    const customer = await CRMCustomer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    const log = customer.logs.id(req.params.logId);
    if (!log) {
      return res.status(404).json({ error: "Log not found" });
    }
    log.deleteOne();
    const savedCustomer = await customer.save();
    res.json({ message: "Log deleted", customer: savedCustomer });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

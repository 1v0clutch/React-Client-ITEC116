const Quotation = require("../models/Quotation");
const SalesOrder = require("../models/SalesOrder");

exports.createQuotation = async (req, res) => {
  try {
    const quotation = new Quotation(req.body);
    await quotation.save();
    res.status(201).json({ message: "Quotation created successfully", quotation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find().populate("productId").populate("convertedToOrderId");
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id).populate("productId").populate("convertedToOrderId");
    if (!quotation) return res.status(404).json({ error: "Quotation not found" });
    res.json(quotation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("productId").populate("convertedToOrderId");
    if (!quotation) return res.status(404).json({ error: "Quotation not found" });
    res.json({ message: "Quotation updated successfully", quotation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);
    if (!quotation) return res.status(404).json({ error: "Quotation not found" });
    res.json({ message: "Quotation deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getQuotationsByCustomer = async (req, res) => {
  try {
    const quotations = await Quotation.find({ customerId: req.params.customerId })
      .populate("productId")
      .populate("convertedToOrderId");
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateQuotationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("productId").populate("convertedToOrderId");
    if (!quotation) return res.status(404).json({ error: "Quotation not found" });
    res.json({ message: "Quotation status updated", quotation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.convertToOrder = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ error: "Quotation not found" });

    if (quotation.status === "expired") {
      return res.status(400).json({ error: "Cannot convert expired quotation" });
    }

    if (quotation.convertedToOrderId) {
      return res.status(400).json({ error: "Quotation already converted to order" });
    }

    const newOrder = new SalesOrder({
      customerId: quotation.customerId,
      productId: quotation.productId,
      quotationId: quotation._id,
      quantity: quotation.quantity,
      discount: quotation.discount,
      tax: quotation.tax,
      status: "pending",
      totalAmount: quotation.totalAmount,
      invoiceStatus: "unpaid",
    });

    await newOrder.save();

    quotation.convertedToOrderId = newOrder._id;
    quotation.status = "accepted";
    await quotation.save();

    res.status(201).json({
      message: "Quotation converted to order successfully",
      order: newOrder,
      quotation: quotation,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.rejectQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    ).populate("productId");
    if (!quotation) return res.status(404).json({ error: "Quotation not found" });
    res.json({ message: "Quotation rejected", quotation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

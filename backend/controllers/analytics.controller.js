const CustomerBehavior = require("../models/CustomerBehavior");
const SalesOrder = require("../models/SalesOrder");
const Quotation = require("../models/Quotation");
const CRMCustomer = require("../models/CRMCustomer");

exports.calculateCustomerBehavior = async (req, res) => {
  try {
    const customers = await CRMCustomer.find();

    const behaviorData = [];

    for (const customer of customers) {
      const orders = await SalesOrder.find({ customerId: customer._id });
      const quotations = await Quotation.find({ customerId: customer._id });

      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

      const totalQuotations = quotations.length;
      const acceptedQuotations = quotations.filter((q) => q.status === "accepted").length;
      const rejectedQuotations = quotations.filter((q) => q.status === "rejected").length;
      const conversionRate = totalQuotations > 0 ? (acceptedQuotations / totalQuotations) * 100 : 0;

      const lastOrderDate = orders.length > 0 ? new Date(Math.max(...orders.map((o) => new Date(o.createdAt)))) : null;
      const firstOrderDate = orders.length > 0 ? new Date(Math.min(...orders.map((o) => new Date(o.createdAt)))) : null;

      let orderFrequency = "new";
      if (totalOrders > 0) {
        if (totalOrders >= 10) orderFrequency = "frequent";
        else if (totalOrders >= 5) orderFrequency = "regular";
        else orderFrequency = "rare";
      }

      const productCounts = {};
      orders.forEach((order) => {
        const productId = order.productId?.toString() || order.productId;
        productCounts[productId] = (productCounts[productId] || 0) + 1;
      });

      let preferredProductId = null;
      let preferredProduct = null;
      let maxCount = 0;

      for (const [productId, count] of Object.entries(productCounts)) {
        if (count > maxCount) {
          maxCount = count;
          preferredProductId = productId;
        }
      }

      const totalItems = orders.reduce((sum, o) => sum + (o.quantity || 0), 0);
      const averageDiscount = totalOrders > 0 ? orders.reduce((sum, o) => sum + (o.discount || 0), 0) / totalOrders : 0;

      let loyaltyScore = 0;
      loyaltyScore += Math.min(totalOrders * 5, 30);
      loyaltyScore += Math.min(totalSpent / 1000, 30);
      loyaltyScore += conversionRate > 50 ? 20 : conversionRate > 25 ? 10 : 5;
      loyaltyScore += customer.segment === "VIP" ? 15 : 0;

      let riskCategory = "low";
      if (rejectedQuotations > acceptedQuotations || conversionRate < 20) riskCategory = "high";
      else if (conversionRate < 50 || totalOrders < 2) riskCategory = "medium";

      let behavior = await CustomerBehavior.findOne({ customerId: customer._id });

      const behaviorObj = {
        customerId: customer._id,
        totalOrders,
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
        totalQuotations,
        acceptedQuotations,
        rejectedQuotations,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        lastOrderDate,
        firstOrderDate,
        orderFrequency,
        preferredProductId,
        preferredProduct,
        totalItems,
        averageDiscount: parseFloat(averageDiscount.toFixed(2)),
        loyaltyScore: Math.min(Math.round(loyaltyScore), 100),
        riskCategory,
        lastUpdated: new Date(),
      };

      if (behavior) {
        behavior = await CustomerBehavior.findByIdAndUpdate(behavior._id, behaviorObj, { new: true });
      } else {
        behavior = new CustomerBehavior(behaviorObj);
        await behavior.save();
      }

      behaviorData.push(behavior);
    }

    res.json({ message: "Customer behavior calculated successfully", data: behaviorData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCustomerBehaviors = async (req, res) => {
  try {
    const behaviors = await CustomerBehavior.find()
      .populate("customerId", "name email segment")
      .populate("preferredProductId", "name");
    res.json(behaviors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCustomerBehaviorById = async (req, res) => {
  try {
    const behavior = await CustomerBehavior.findById(req.params.id)
      .populate("customerId", "name email segment")
      .populate("preferredProductId", "name");
    if (!behavior) return res.status(404).json({ error: "Behavior record not found" });
    res.json(behavior);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBehaviorByCustomerId = async (req, res) => {
  try {
    const behavior = await CustomerBehavior.findOne({ customerId: req.params.customerId })
      .populate("customerId", "name email segment")
      .populate("preferredProductId", "name");
    if (!behavior) return res.status(404).json({ error: "Behavior record not found" });
    res.json(behavior);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAnalyticsSummary = async (req, res) => {
  try {
    const behaviors = await CustomerBehavior.find();

    const summary = {
      totalCustomers: behaviors.length,
      averageLoyaltyScore: behaviors.length > 0 ? (behaviors.reduce((sum, b) => sum + b.loyaltyScore, 0) / behaviors.length).toFixed(2) : 0,
      totalOrdersAllCustomers: behaviors.reduce((sum, b) => sum + b.totalOrders, 0),
      totalRevenueAllCustomers: parseFloat(behaviors.reduce((sum, b) => sum + b.totalSpent, 0).toFixed(2)),
      frequentBuyers: behaviors.filter((b) => b.orderFrequency === "frequent").length,
      highRiskCustomers: behaviors.filter((b) => b.riskCategory === "high").length,
      highValueCustomers: behaviors.filter((b) => b.totalSpent > 10000).length,
      conversionRateAverage: behaviors.length > 0 ? (behaviors.reduce((sum, b) => sum + b.conversionRate, 0) / behaviors.length).toFixed(2) : 0,
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

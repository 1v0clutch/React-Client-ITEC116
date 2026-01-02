const mongoose = require("mongoose");

const CustomerBehaviorSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CRMCustomer",
      required: true,
      unique: true,
    },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    totalQuotations: { type: Number, default: 0 },
    acceptedQuotations: { type: Number, default: 0 },
    rejectedQuotations: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    lastOrderDate: { type: Date, default: null },
    firstOrderDate: { type: Date, default: null },
    orderFrequency: { type: String, enum: ["new", "rare", "regular", "frequent"], default: "new" },
    preferredProduct: { type: String, default: null },
    preferredProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      default: null,
    },
    totalItems: { type: Number, default: 0 },
    averageDiscount: { type: Number, default: 0 },
    loyaltyScore: { type: Number, default: 0, min: 0, max: 100 },
    riskCategory: { type: String, enum: ["low", "medium", "high"], default: "low" },
    lastUpdated: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomerBehavior", CustomerBehaviorSchema);

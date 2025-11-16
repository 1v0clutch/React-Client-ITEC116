const Joi = require("joi");

/* ================================
   MODULE 1 (Inventory)
================================ */

// Inventory Validation
const validateInventoryItem = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    sku: Joi.string().alphanum().min(3).max(20).required(),
    description: Joi.string().allow("", null),
    category: Joi.string().required(),
    quantity: Joi.number().integer().min(0).required(),
  });
  return schema.validate(data);
};

// Transaction Validation
const validateTransaction = (data) => {
  const schema = Joi.object({
    itemId: Joi.string().hex().length(24).required(), // MongoDB ObjectId
    type: Joi.string().valid("stock-in", "stock-out").required(),
    quantity: Joi.number().integer().positive().required(),
    remarks: Joi.string().allow("", null),
    expiryDate: Joi.date().allow(null),
    purchaseOrderId: Joi.string().hex().length(24).allow(null), // link to Module 3
  });
  return schema.validate(data);
};

// Warehouse Validation
const validateWarehouse = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    location: Joi.string().min(2).max(200).required(),
  });
  return schema.validate(data);
};

const validateWarehouseTransfer = (data) => {
  const schema = Joi.object({
    itemId: Joi.string().hex().length(24).required(),
    fromWarehouseId: Joi.string().required(),
    toWarehouseId: Joi.string().required(),
    quantity: Joi.number().integer().positive().required(),
  });
  return schema.validate(data);
};

/* ================================
   MODULE 3 (Procurement)
================================ */

// Supplier Validation
const validateSupplier = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    contactInfo: Joi.string().required(), // expect combined phone/email/address
    rating: Joi.number().min(0).max(5).default(0),
    contractTerms: Joi.string().allow("", null),
    productCatalog: Joi.array().items(Joi.string()).optional(), // accept products
  });
  return schema.validate(data);
};

// Purchase Requisition Validation
const validateRequisition = (data) => {
  const schema = Joi.object({
    requester: Joi.string().required(),
    supplierId: Joi.string().hex().length(24).required(), // ✅ Supplier reference
    items: Joi.array()
      .items(
        Joi.object({
          itemId: Joi.string().required(), // ✅ plain string, product name
          quantity: Joi.number().min(1).required(),
        })
      )
      .min(1)
      .required(),
    status: Joi.string()
      .valid("pending", "approved", "rejected")
      .default("pending"),
  });
  return schema.validate(data);
};


// Purchase Order Validation
const validatePurchaseOrder = (data) => {
  const schema = Joi.object({
    requisitionId: Joi.string().hex().length(24).required(),
    supplierId: Joi.string().hex().length(24).required(),
    items: Joi.array()
      .items(
        Joi.object({
          itemId: Joi.string().min(1).required(),
          quantity: Joi.number().integer().positive().required(),
          price: Joi.number().positive().required(),
        })
      )
      .min(1)
      .required(),
    status: Joi.string()
      .valid("draft", "sent", "confirmed", "delivered", "cancelled")
      .default("draft"),
    dateIssued: Joi.date().default(Date.now),
  });
  return schema.validate(data);
};


// Invoice Validation
const validateInvoice = (data) => {
  const schema = Joi.object({
    purchaseOrderId: Joi.string().hex().length(24).required(),
    supplierId: Joi.string().hex().length(24).required(),
    invoiceNumber: Joi.string().required(),
    items: Joi.array()
      .items(
        Joi.object({
          itemId: Joi.string().min(1).required(), // product name string
          quantity: Joi.number().integer().min(1).required(),
          unitPrice: Joi.number().positive().required(),
        })
      )
      .min(1)
      .required(),
    totalAmount: Joi.number().positive().required(),
    status: Joi.string().valid("pending", "approved", "paid").default("pending"),
    remarks: Joi.string().allow("", null).optional(), // ✅ now empty string is valid
  });

  return schema.validate(data, { abortEarly: false });
};


module.exports = { validateInvoice };



module.exports = {
  // Module 1
  validateInventoryItem,
  validateTransaction,
  validateWarehouse,
  validateWarehouseTransfer,
  // Module 3
  validateSupplier,
  validateRequisition,
  validatePurchaseOrder,
  validateInvoice,
};

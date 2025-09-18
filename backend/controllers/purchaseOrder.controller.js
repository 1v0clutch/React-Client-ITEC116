const PurchaseOrder = require("../models/PurchaseOrder");
const Inventory = require("../models/Inventory");
const Transaction = require("../models/Transaction");

exports.createPurchaseOrder = async (req, res) => {
  try {
    const { supplierId, items, requisitionId } = req.body;
    if (!supplierId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "supplierId and items[] are required" });
    }

    const po = new PurchaseOrder({
      supplierId,
      items,
      requisitionId: requisitionId || null,
      status: "sent"
    });

    await po.save();
    res.status(201).json(po);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPOs = async (req, res) => {
  try {
    const pos = await PurchaseOrder.find().populate("supplierId", "name");
    res.json(pos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPOById = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id).populate("supplierId", "name contactInfo");
    if (!po) return res.status(404).json({ error: "PO not found" });
    res.json(po);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update status: if status becomes 'delivered' you may include receivedItems in body to process stock-in
// body example to process goods receipt: { status: "delivered", receivedItems: [{ itemId, receivedQuantity, warehouseId? }] }
exports.updatePOStatus = async (req, res) => {
  try {
    const { status, receivedItems } = req.body;
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ error: "PO not found" });

    // set status
    po.status = status || po.status;

    // If delivered and receivedItems provided, create stock-in transactions and update inventory
    if (status === "delivered" && Array.isArray(receivedItems) && receivedItems.length > 0) {
      // For each received item: update Inventory quantity and create Transaction (stock-in)
      for (const r of receivedItems) {
        const { itemId, receivedQuantity } = r;
        if (!itemId || typeof receivedQuantity !== "number") continue;

        const item = await Inventory.findById(itemId);
        if (!item) {
          // skip or gather errors — for simplicity skip missing item
          continue;
        }

        // update inventory quantity
        item.quantity = (item.quantity || 0) + receivedQuantity;
        await item.save();

        // create transaction with purchaseOrderId to serve as Goods Receipt record
        const trx = new Transaction({
          itemId,
          type: "stock-in",
          quantity: receivedQuantity,
          purchaseOrderId: po._id,
        });
        await trx.save();
      }
    }

    await po.save();
    res.json(po);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
import React, { useState, useEffect } from "react";

const Transaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [items, setItems] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [currentTransaction, setCurrentTransaction] = useState({
    itemId: "",
    type: "stock-in",
    quantity: 0,
    remarks: "",
    expiryDate: "",
    purchaseOrderId: "",
  });
  const [message, setMessage] = useState("");

  const API_TRANSACTIONS = "http://localhost:8000/api/transactions";
  const API_INVENTORY = "http://localhost:8000/api/inventory";
  const API_PURCHASE_ORDERS = "http://localhost:8000/api/purchase-orders";
  const API_FINANCE = "http://localhost:8000/api/finance/inventory-transaction";

  // Fetch initial data
  useEffect(() => {
    fetchTransactions();
    fetchItems();
    fetchPurchaseOrders();
  }, []);

  // Fetch all transactions
  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_TRANSACTIONS}/getTransactionRecords`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      setMessage(`Error fetching transactions: ${error.message}`);
    }
  };

  // Fetch inventory items for dropdown
  const fetchItems = async () => {
    try {
      const response = await fetch(`${API_INVENTORY}/getItems`);
      const data = await response.json();
      setItems(data);
    } catch (error) {
      setMessage(`Error fetching items: ${error.message}`);
    }
  };

  // Fetch purchase orders (for dropdown)
  const fetchPurchaseOrders = async () => {
    try {
      const response = await fetch(API_PURCHASE_ORDERS);
      const data = await response.json();
      setPurchaseOrders(data);
    } catch (error) {
      setMessage(`Error fetching purchase orders: ${error.message}`);
    }
  };

  // Record new transaction
  const recordTransaction = async () => {
    try {
      if (!currentTransaction.itemId || currentTransaction.quantity <= 0) {
        setMessage("Please select an item and enter a valid quantity.");
        return;
      }

      // Prepare transaction for backend
      const transactionData = {
        itemId: currentTransaction.itemId,
        type: currentTransaction.type,
        quantity: currentTransaction.quantity,
        remarks: currentTransaction.remarks || "N/A",
        expiryDate: currentTransaction.expiryDate || null,
        purchaseOrderId: currentTransaction.purchaseOrderId || null,
      };

      // Send to Inventory/Transaction API
      const response = await fetch(`${API_TRANSACTIONS}/addTransactionRecord`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      });

      const data = await response.json();

      // Send also to Finance API
      const financeData = {
        productId: transactionData.itemId,
        transactionType: transactionData.type,
        quantity: transactionData.quantity,
        remarks: transactionData.remarks,
        purchaseOrderId: transactionData.purchaseOrderId,
        date: new Date().toISOString(),
        unitPrice: 0,
      };

      await fetch(API_FINANCE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(financeData),
      });

      if (response.ok) {
        setMessage("Transaction recorded successfully!");
        resetForm();
        fetchTransactions();
      } else {
        setMessage(data.error || "Failed to record transaction");
      }
    } catch (error) {
      setMessage(`Error recording transaction: ${error.message}`);
    }
  };

  // Reset form
  const resetForm = () => {
    setCurrentTransaction({
      itemId: "",
      type: "stock-in",
      quantity: 0,
      remarks: "",
      expiryDate: "",
      purchaseOrderId: "",
    });
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>

      {/* Message Display */}
      {message && (
        <div className="p-2.5 mb-5 bg-[#f0f0f0] border-gray-400 rounded-sm">
          {message}
          <button
            onClick={() => setMessage("")}
            className="float-right bg-none border-none cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Add Transaction Form */}
      <div className="mb-8 mt-4 p-4 bg-[#f0f0f0] border rounded-md">
        <h3 className="font-semibold mb-4">Record Transaction</h3>

        <div className="mb-4">
          <label>Item: </label>
          <select
            value={currentTransaction.itemId}
            onChange={(e) =>
              setCurrentTransaction({
                ...currentTransaction,
                itemId: e.target.value,
              })
            }
            className="p-1 w-[300px] border rounded-sm outline-none"
          >
            <option value="">Select Item</option>
            {items.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name} ({item.sku})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label>Type: </label>
          <select
            value={currentTransaction.type}
            onChange={(e) =>
              setCurrentTransaction({
                ...currentTransaction,
                type: e.target.value,
              })
            }
            className="p-1 w-[300px] border rounded-sm outline-none"
          >
            <option value="stock-in">Stock In</option>
            <option value="stock-out">Stock Out</option>
          </select>
        </div>

        <div className="mb-4">
          <label>Quantity: </label>
          <input
            type="number"
            min="1"
            value={currentTransaction.quantity}
            onChange={(e) =>
              setCurrentTransaction({
                ...currentTransaction,
                quantity: parseInt(e.target.value) || 0,
              })
            }
            className="p-1 w-[300px] border rounded-sm outline-none"
          />
        </div>

        <div className="mb-4">
          <label>Remarks: </label>
          <input
            type="text"
            value={currentTransaction.remarks}
            onChange={(e) =>
              setCurrentTransaction({
                ...currentTransaction,
                remarks: e.target.value,
              })
            }
            className="p-1 w-[300px] border rounded-sm outline-none"
            placeholder="Optional"
          />
        </div>

        <div className="mb-4">
          <label>Expiry Date: </label>
          <input
            type="date"
            value={currentTransaction.expiryDate}
            onChange={(e) =>
              setCurrentTransaction({
                ...currentTransaction,
                expiryDate: e.target.value,
              })
            }
            className="p-1 w-[300px] border rounded-sm outline-none"
          />
        </div>

        {/* ✅ Auto-fill remarks when selecting PO */}
        <div className="mb-4">
          <label>Purchase Order: </label>
          <select
            value={currentTransaction.purchaseOrderId}
            onChange={(e) => {
              const selectedPOId = e.target.value;
              const selectedPO = purchaseOrders.find(
                (po) => po._id === selectedPOId
              );

              setCurrentTransaction({
                ...currentTransaction,
                purchaseOrderId: selectedPOId,
                remarks: selectedPO
                  ? `From Purchase Order ${selectedPO.poNumber}`
                  : currentTransaction.remarks,
              });
            }}
            className="p-1 w-[300px] border rounded-sm outline-none"
          >
            <option value="">Select Purchase Order (optional)</option>
            {purchaseOrders.map((po) => (
              <option key={po._id} value={po._id}>
                {po.poNumber} - {po.status}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={recordTransaction}
          className="p-2 px-4 border rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Record Transaction
        </button>
      </div>

      {/* Transactions List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Transactions ({transactions.length})
        </h3>

        {transactions.length === 0 ? (
          <p className="text-gray-600">No transactions recorded.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2.5 border">Item</th>
                <th className="p-2.5 border">Type</th>
                <th className="p-2.5 border">Quantity</th>
                <th className="p-2.5 border">Remarks</th>
                <th className="p-2.5 border">Expiry Date</th>
                <th className="p-2.5 border">Purchase Order</th>
                <th className="p-2.5 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id} className="hover:bg-gray-50">
                  <td className="p-2.5 border">
                    {t.itemId?.name} ({t.itemId?.sku})
                  </td>
                  <td className="p-2.5 border">{t.type}</td>
                  <td className="p-2.5 border">{t.quantity}</td>
                  <td className="p-2.5 border">{t.remarks || "N/A"}</td>
                  <td className="p-2.5 border">
                    {t.expiryDate
                      ? new Date(t.expiryDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="p-2.5 border">
                    {t.purchaseOrderId
                      ? t.purchaseOrderId.status || "N/A"
                      : "N/A"}
                  </td>
                  <td className="p-2.5 border">
                    {new Date(t.transactionDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Transaction;

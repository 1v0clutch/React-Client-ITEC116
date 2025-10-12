import React, { useState, useEffect } from "react";

const Transaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [items, setItems] = useState([]);
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

  useEffect(() => {
    fetchTransactions();
    fetchItems();
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

  // Record new transaction
  const recordTransaction = async () => {
    try {
      const transactionData = {
        ...currentTransaction,
        purchaseOrderId:
          currentTransaction.purchaseOrderId.trim() === ""
            ? null
            : currentTransaction.purchaseOrderId,
      };

      const response = await fetch(`${API_TRANSACTIONS}/addTransactionRecord`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
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
      <h1>Transactions</h1>

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
      <div className="mb-8 mt-4 p-4 bg-[#f0f0f0] border">
        <h3>Record Transaction</h3>

        <div className="mb-4 mt-4">
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

        <div className="mb-4 mt-4">
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

        <div className="mb-4 mt-4">
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
            required
            className="p-1 w-[300px] border rounded-sm outline-none"
          />
        </div>

        <div className="mb-4 mt-4">
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
          />
        </div>

        <div className="mb-4 mt-4">
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

        <div className="mb-4 mt-4">
          <label>Purchase Order (optional): </label>
          <input
            type="text"
            placeholder="Enter Purchase Order ID"
            value={currentTransaction.purchaseOrderId}
            onChange={(e) =>
              setCurrentTransaction({
                ...currentTransaction,
                purchaseOrderId: e.target.value,
              })
            }
            className="p-1 w-[300px] border rounded-sm outline-none"
          />
        </div>

        <button
          type="button"
          onClick={recordTransaction}
          className="p-2 border rounded-2xl cursor-pointer"
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
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2.5 border border-gray-300 text-left">Item</th>
                <th className="p-2.5 border border-gray-300 text-left">Type</th>
                <th className="p-2.5 border border-gray-300 text-left">
                  Quantity
                </th>
                <th className="p-2.5 border border-gray-300 text-left">
                  Remarks
                </th>
                <th className="p-2.5 border border-gray-300 text-left">
                  Expiry Date
                </th>
                <th className="p-2.5 border border-gray-300 text-left">
                  Purchase Order
                </th>
                <th className="p-2.5 border border-gray-300 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id} className="hover:bg-gray-50">
                  <td className="p-2.5 border border-gray-300">
                    {t.itemId?.name} ({t.itemId?.sku})
                  </td>
                  <td className="p-2.5 border border-gray-300">{t.type}</td>
                  <td className="p-2.5 border border-gray-300">{t.quantity}</td>
                  <td className="p-2.5 border border-gray-300">
                    {t.remarks || "N/A"}
                  </td>
                  <td className="p-2.5 border border-gray-300">
                    {t.expiryDate
                      ? new Date(t.expiryDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="p-2.5 border border-gray-300">
                    {t.purchaseOrderId
                      ? `${t.purchaseOrderId.status} (${new Date(
                          t.purchaseOrderId.orderDate
                        ).toLocaleDateString()})`
                      : "N/A"}
                  </td>
                  <td className="p-2.5 border border-gray-300">
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

import React, { useState, useEffect } from "react";
import { TrendingUp, Plus, X, CheckCircle, AlertCircle, Calendar, Package } from "lucide-react";
import TransactionModal from "../../components/modals/TransactionModal";

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
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showModal, setShowModal] = useState(false);

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

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_TRANSACTIONS}/getTransactionRecords`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      setMessage({ text: `Error fetching transactions: ${error.message}`, type: "error" });
    }
  };

  const fetchItems = async () => {
    try {
      const response = await fetch(`${API_INVENTORY}/getItems`);
      const data = await response.json();
      setItems(data);
    } catch (error) {
      setMessage({ text: `Error fetching items: ${error.message}`, type: "error" });
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const response = await fetch(API_PURCHASE_ORDERS);
      const data = await response.json();
      setPurchaseOrders(data);
    } catch (error) {
      setMessage({ text: `Error fetching purchase orders: ${error.message}`, type: "error" });
    }
  };

  const recordTransaction = async () => {
    try {
      if (!currentTransaction.itemId || currentTransaction.quantity <= 0) {
        setMessage({ text: "Please select an item and enter a valid quantity.", type: "error" });
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
        setMessage({ text: data.message || "Transaction recorded successfully", type: "success" });
        resetForm();
        fetchTransactions();
      } else {
        setMessage({ text: data.error || "Failed to record transaction", type: "error" });
      }
    } catch (error) {
      setMessage({ text: `Error recording transaction: ${error.message}`, type: "error" });
    }
  };

  const resetForm = () => {
    setCurrentTransaction({
      itemId: "",
      type: "stock-in",
      quantity: 0,
      remarks: "",
      expiryDate: "",
      purchaseOrderId: "",
    });
    setShowModal(false);
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-10 h-10" />
              <h1 className="text-4xl font-bold">
                Transaction Management
              </h1>
            </div>
          </div>
          <button
            onClick={openModal}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors flex items-center gap-2 text-white"
          >
            <Plus className="w-5 h-5" />
            Record Transaction
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
          message.type === "success" 
            ? "bg-green-500/10 border border-green-500/30 text-green-400" 
            : "bg-red-500/10 border border-red-500/30 text-red-400"
        }`}>
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage({ text: "", type: "" })}
            className="hover:opacity-70 transition-opacity"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Transactions List */}
      <div className="border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">
            Transaction History ({transactions.length})
          </h3>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No transactions recorded</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-4 px-4 font-medium">Item</th>
                  <th className="text-left py-4 px-4 font-medium">Type</th>
                  <th className="text-left py-4 px-4 font-medium">Quantity</th>
                  <th className="text-left py-4 px-4 font-medium">Remarks</th>
                  <th className="text-left py-4 px-4 font-medium">Expiry Date</th>
                  <th className="text-left py-4 px-4 font-medium">Purchase Order</th>
                  <th className="text-left py-4 px-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr
                    key={t._id}
                    className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{t.itemId?.name}</div>
                          <div className="text-sm">{t.itemId?.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        t.type === "stock-in" 
                          ? "bg-green-500/20 text-green-400" 
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        {t.type === "stock-in" ? "Stock In" : "Stock Out"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-blue-400">{t.quantity}</span>
                    </td>
                    <td className="py-4 px-4">
                      {t.remarks || "N/A"}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {t.expiryDate ? (
                          <>
                            <Calendar className="w-4 h-4" />
                            {new Date(t.expiryDate).toLocaleDateString()}
                          </>
                        ) : (
                          "N/A"
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {t.purchaseOrderId
                        ? `${t.purchaseOrderId.status} (${new Date(
                            t.purchaseOrderId.orderDate
                          ).toLocaleDateString()})`
                        : "N/A"}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(t.transactionDate).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Component - NOW WITH PURCHASE ORDERS */}
      <TransactionModal
        isOpen={showModal}
        onClose={resetForm}
        currentTransaction={currentTransaction}
        setCurrentTransaction={setCurrentTransaction}
        onSubmit={recordTransaction}
        items={items}
        purchaseOrders={purchaseOrders}
      />
    </div>
  );
};

export default Transaction;
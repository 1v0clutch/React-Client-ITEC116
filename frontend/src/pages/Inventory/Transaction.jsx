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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Transaction Management</h1>
              <p className="text-white/80 text-sm">Track Stock Movements & Transactions</p>
            </div>
          </div>
          <button
            onClick={openModal}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Record Transaction
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-xl flex items-center justify-between ${
          message.type === "success" 
            ? "bg-green-100 border border-green-300 text-green-800" 
            : "bg-red-100 border border-red-300 text-red-800"
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

      {/* Enhanced Transactions List */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Transaction History</h3>
              <p className="text-white/80 text-sm">{transactions.length} recorded transactions</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-500">No transactions recorded</p>
              <p className="text-gray-400 mt-2">Record your first transaction above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Item</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-700">Type</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-700">Quantity</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Remarks</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-700">Expiry Date</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Purchase Order</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr
                      key={t._id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-blue-500" />
                          <div>
                            <div className="font-medium text-gray-800">{t.itemId?.name}</div>
                            <div className="text-sm text-gray-600">{t.itemId?.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          t.type === "stock-in" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {t.type === "stock-in" ? "Stock In" : "Stock Out"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">{t.quantity}</span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {t.remarks || "N/A"}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {t.expiryDate ? (
                            <>
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{new Date(t.expiryDate).toLocaleDateString()}</span>
                            </>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {t.purchaseOrderId
                          ? `${t.purchaseOrderId.status} (${new Date(
                              t.purchaseOrderId.orderDate
                            ).toLocaleDateString()})`
                          : "N/A"}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{new Date(t.transactionDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
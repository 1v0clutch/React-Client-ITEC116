import React from "react";
import { X, Plus } from "lucide-react";

const TransactionModal = ({ 
  isOpen, 
  onClose, 
  currentTransaction, 
  setCurrentTransaction, 
  onSubmit,
  items 
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Plus className="w-6 h-6 text-green-400" />
            <h3 className="text-2xl font-semibold text-white">
              Record Transaction
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Item *
              </label>
              <select
                value={currentTransaction.itemId}
                onChange={(e) =>
                  setCurrentTransaction({
                    ...currentTransaction,
                    itemId: e.target.value,
                  })
                }
                required
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select Item</option>
                {items.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name} ({item.sku})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Type *
              </label>
              <select
                value={currentTransaction.type}
                onChange={(e) =>
                  setCurrentTransaction({
                    ...currentTransaction,
                    type: e.target.value,
                  })
                }
                required
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="stock-in">Stock In</option>
                <option value="stock-out">Stock Out</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Quantity *
              </label>
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
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                value={currentTransaction.expiryDate}
                onChange={(e) =>
                  setCurrentTransaction({
                    ...currentTransaction,
                    expiryDate: e.target.value,
                  })
                }
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Purchase Order ID
              </label>
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
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Remarks
              </label>
              <textarea
                value={currentTransaction.remarks}
                onChange={(e) =>
                  setCurrentTransaction({
                    ...currentTransaction,
                    remarks: e.target.value,
                  })
                }
                rows="3"
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4" />
              Record Transaction
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
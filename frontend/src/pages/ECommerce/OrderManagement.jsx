import React, { useState, useEffect } from "react";
import Toast from "../../components/Toast";

const API_BASE = "http://localhost:8000/api";

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE}/ecommerce/orders/all`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setToast({
        message: `Failed to load orders: ${error.message}`,
        type: "error"
      });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`${API_BASE}/ecommerce/orders/status/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) throw new Error("Failed to update status");
      
      setToast({
        message: "Order status updated successfully!",
        type: "success"
      });
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      setToast({
        message: "Failed to update order status",
        type: "error"
      });
    }
  };

  const updatePaymentStatus = async (orderId, paymentStatus) => {
    try {
      const response = await fetch(`${API_BASE}/ecommerce/orders/payment/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      });
      
      if (!response.ok) throw new Error("Failed to update payment status");
      
      setToast({
        message: "Payment status updated successfully!",
        type: "success"
      });
      fetchOrders();
    } catch (error) {
      console.error("Error updating payment status:", error);
      setToast({
        message: "Failed to update payment status",
        type: "error"
      });
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order? Inventory will be restored.")) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/ecommerce/orders/cancel/${orderId}`, {
        method: "PUT",
      });
      
      if (!response.ok) throw new Error("Failed to cancel order");
      
      setToast({
        message: "Order cancelled successfully! Inventory has been restored.",
        type: "success",
        duration: 4000
      });
      fetchOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
      setToast({
        message: "Failed to cancel order",
        type: "error"
      });
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  if (loading) {
    return <div className="p-5">Loading orders...</div>;
  }

  return (
    <div className="p-5">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={toast.duration || 3000}
        />
      )}
      <h1 className="text-2xl font-bold mb-5">Order Management</h1>

      {orders.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No orders found
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Order Number</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-center">Items</th>
                <th className="px-4 py-3 text-center">Total</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Payment</th>
                <th className="px-4 py-3 text-center">Date</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{order.orderNumber}</td>
                  <td className="px-4 py-3">
                    {order.customerId?.name || "N/A"}
                    <br />
                    <span className="text-xs text-gray-500">
                      {order.customerId?.email}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{order.items.length}</td>
                  <td className="px-4 py-3 text-center font-semibold">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className={`px-2 py-1 rounded text-sm ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                      disabled={order.status === "cancelled"}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={order.paymentStatus}
                      onChange={(e) => updatePaymentStatus(order._id, e.target.value)}
                      className={`px-2 py-1 rounded text-sm ${
                        order.paymentStatus === "paid"
                          ? "bg-green-100 text-green-800"
                          : order.paymentStatus === "refunded"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-red-100 text-red-800"
                      }`}
                      disabled={order.status === "cancelled"}
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => viewOrderDetails(order)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 mr-2"
                    >
                      View
                    </button>
                    {order.status !== "cancelled" && (
                      <button
                        onClick={() => cancelOrder(order._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Order Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">Order Number</p>
              <p className="font-mono font-semibold">{selectedOrder.orderNumber}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">Customer</p>
              <p className="font-semibold">{selectedOrder.customerId?.name}</p>
              <p className="text-sm">{selectedOrder.customerId?.email}</p>
              <p className="text-sm">{selectedOrder.customerId?.phone}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">Shipping Address</p>
              <p className="text-sm">
                {selectedOrder.shippingAddress?.street}<br />
                {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}<br />
                {selectedOrder.shippingAddress?.country}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Order Items</p>
              <table className="w-full border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left">Product</th>
                    <th className="px-3 py-2 text-center">Quantity</th>
                    <th className="px-3 py-2 text-center">Unit Price</th>
                    <th className="px-3 py-2 text-center">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-3 py-2">{item.productName}</td>
                      <td className="px-3 py-2 text-center">{item.quantity}</td>
                      <td className="px-3 py-2 text-center">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-3 py-2 text-center">${item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 font-bold">
                  <tr>
                    <td colSpan="3" className="px-3 py-2 text-right">Total:</td>
                    <td className="px-3 py-2 text-center">${selectedOrder.totalAmount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Order Status</p>
                <p className="font-semibold capitalize">{selectedOrder.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <p className="font-semibold capitalize">{selectedOrder.paymentStatus}</p>
              </div>
            </div>

            {selectedOrder.salesOrderId && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">Linked Sales Order ID</p>
                <p className="font-mono text-sm">{selectedOrder.salesOrderId}</p>
              </div>
            )}

            <button
              onClick={closeModal}
              className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderManagement;

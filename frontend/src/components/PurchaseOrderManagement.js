// components/PurchaseOrderManagement.js
import React from 'react';

const PurchaseOrderManagement = () => {
  const orders = [
    { poNumber: 'PO001', supplier: 'ABC Supplies', status: 'Sent' },
    { poNumber: 'PO002', supplier: 'XYZ Traders', status: 'Delivered' }
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Purchase Orders</h2>

      <button className="bg-purple-600 text-white px-4 py-2 rounded mb-4">
        Create Purchase Order
      </button>

      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">PO Number</th>
            <th className="border p-2">Supplier</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={index}>
              <td className="border p-2">{order.poNumber}</td>
              <td className="border p-2">{order.supplier}</td>
              <td className="border p-2">{order.status}</td>
              <td className="border p-2">
                <button className="text-purple-600 underline">View / Match Invoice</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseOrderManagement;

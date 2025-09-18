// components/GoodsReceiptInvoice.js
import React from 'react';

const GoodsReceiptInvoice = () => {
  const receipts = [
    { id: 'GR001', poNumber: 'PO001', status: 'Matched' },
    { id: 'GR002', poNumber: 'PO002', status: 'Pending' }
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Goods Receipt & Invoice Matching</h2>

      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">PO Number</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {receipts.map((r, index) => (
            <tr key={index}>
              <td className="border p-2">{r.id}</td>
              <td className="border p-2">{r.poNumber}</td>
              <td className="border p-2">{r.status}</td>
              <td className="border p-2">
                <button className="text-red-600 underline">Verify / Approve Payment</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GoodsReceiptInvoice;
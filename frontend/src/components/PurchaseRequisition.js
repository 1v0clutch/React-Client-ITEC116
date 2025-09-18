// components/PurchaseRequisition.js
import React, { useState } from 'react';

const PurchaseRequisition = () => {
  const [requisitions, setRequisitions] = useState([
    { id: 'REQ001', item: 'Laptop', department: 'IT', status: 'Pending' },
    { id: 'REQ002', item: 'Printer', department: 'Admin', status: 'Approved' }
  ]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Purchase Requisition</h2>

      <button className="bg-blue-600 text-white px-4 py-2 rounded mb-4">
        Create Requisition
      </button>

      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Item</th>
            <th className="border p-2">Department</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {requisitions.map((req) => (
            <tr key={req.id}>
              <td className="border p-2">{req.id}</td>
              <td className="border p-2">{req.item}</td>
              <td className="border p-2">{req.department}</td>
              <td className="border p-2">{req.status}</td>
              <td className="border p-2">
                <button className="text-blue-600 underline">View / Approve</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseRequisition;
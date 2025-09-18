// components/SupplierManagement.js
import React from 'react';

const SupplierManagement = () => {
  const suppliers = [
    { name: 'ABC Supplies', contact: 'abc@gmail.com', rating: 4.5 },
    { name: 'XYZ Traders', contact: 'xyz@gmail.com', rating: 4.2 }
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Supplier Management</h2>

      <button className="bg-green-600 text-white px-4 py-2 rounded mb-4">
        Add Supplier
      </button>

      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Contact</th>
            <th className="border p-2">Rating</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((sup, index) => (
            <tr key={index}>
              <td className="border p-2">{sup.name}</td>
              <td className="border p-2">{sup.contact}</td>
              <td className="border p-2">{sup.rating}</td>
              <td className="border p-2">
                <button className="text-green-600 underline">Edit / View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SupplierManagement;
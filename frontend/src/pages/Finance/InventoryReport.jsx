import React, { useEffect, useState } from 'react';

export default function InventoryReport() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/finance/inventory-transactions')
      .then(res => res.json())
      .then(data => setTransactions(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1 className='justify-items-center m-5'>Inventory Report</h1>
      <nav className="flex gap-6 mb-5 text-blue-700 justify-center">
        <a href='/finance/general-finance'><p className="cursor-pointer hover:underline ">General Ledger</p></a>
        <a href='/finance/supplier-report'><p className="cursor-pointer hover:underline">Accounts Payable (Supplier)</p></a>
        <a href='/finance/customer-report'><p className="cursor-pointer hover:underline">Accounts Receivable (Customer)</p></a>
        <a href='/finance/finance-report'><p className="cursor-pointer hover:underline">Reports and Compliance</p></a>
        <a href='/finance/employee-payroll'><p className="cursor-pointer hover:underline">Employee Payroll (HR)</p></a>
        <a href='/finance/inventory-report'><p className="cursor-pointer hover:underline">Inventory Report</p></a>
      </nav>
      <table className="table-auto w-full border border-gray-400 border-collapse [&_*]:border [&_*]:border-gray-400 [&_*]:px-4 [&_*]:py-2">
        <thead className="bg-gray-100">
          <tr>
            <th>Item</th>
            <th>Type</th>
            <th>Quantity</th>
            <th>Remarks</th>
            <th>Purchase Order</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx._id}>
              <td>{tx.productId}</td>
              <td>{tx.transactionType}</td>
              <td>{tx.quantity}</td>
              <td>{tx.remarks}</td>
              <td>{tx.purchaseOrderId}</td>
              <td>{new Date(tx.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import React from 'react'

export default function CustomerReport() {
  return (
    <div>
      <h1 className='justify-items-center m-5'>Customer Report</h1>
            <nav className="flex gap-6 mb-5 text-blue-700 justify-center">
              <a href='/finance/general-finance'><p className="cursor-pointer hover:underline ">General Ledger</p></a>
              <a href='/finance/supplier-report'><p className="cursor-pointer hover:underline">Accounts Payable (Supplier)</p></a>
              <a href='/finance/customer-report'><p className="cursor-pointer hover:underline">Accounts Receivable (Customer)</p></a>
              <a href='/finance/finance-report'><p className="cursor-pointer hover:underline">Reports and Compliance</p></a>
              <a href='/finance/employee-payroll'><p className="cursor-pointer hover:underline">Employee Payroll (HR)</p></a>
              <a href='/finance/inventory-report'><p className="cursor-pointer hover:underline">Inventory Report</p></a>
            </nav>
            <table className="table-auto w-full border border-gray-400 border-collapse [&_*]:border [&_*]:border-gray-400 [&_*]:px-4 [&_*]:py-2">
               <thead className="bg-gray-100"> {/*Ilalagay Sa for loop based on how many iterations  ang napupurchase through procurement*/}
                <tr> 
                  <th>Test</th>
                  <th>Test</th>
                  <th>Test</th>
                  <th>Test</th>
                  <th>Test</th>
                </tr>
              </thead>
              <tr>
                <td>Test</td>
                <td>Test</td>
                <td>Test</td>
                <td>Test</td>
                <td>Test</td>
              </tr>
            </table>
    </div>
  )
}

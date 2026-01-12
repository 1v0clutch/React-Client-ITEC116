// ========================================
// EXAMPLE: How Other Modules Can Use Original CSS
// ========================================

// This file shows how other modules can import and use the original CSS files
// while SalesCustomer remains isolated with Tailwind

import React from 'react';

// ✅ OTHER MODULES CAN IMPORT THESE CSS FILES:
// import './Module_8style/After_Sales.css';
// import './Module_8style/CM_management.css';
// import './Module_8style/Sales_order.css';
// import './Module_8style/Sales_report.css';

// Example component using original CSS classes
function ExampleOtherModuleComponent() {
  return (
    <div>
      <h2>Example: Other Module Using Original CSS</h2>
      
      {/* These CSS classes are available from the original files: */}
      
      {/* From After_Sales.css */}
      <div className="aftersales-container">
        <div className="form-card">
          <h3>After Sales Form</h3>
          <input type="text" placeholder="Customer Name" />
          <button>Submit Case</button>
        </div>
        
        <div className="case-card">
          <p>Case #123 - Warranty Issue</p>
          <span className="status open">Open</span>
        </div>
      </div>
      
      {/* From CM_management.css */}
      <div className="crm-container">
        <div className="form-card">
          <h3>CRM Management</h3>
          <select>
            <option>Select Customer</option>
          </select>
          <button className="btn-manage">Manage</button>
        </div>
        
        <table className="crm-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Segment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>John Doe</td>
              <td><span className="segment-badge vip">VIP</span></td>
              <td><button className="btn-edit">Edit</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* From Sales_order.css */}
      <div className="container">
        <div className="form-card">
          <h3>Sales Order</h3>
          <input type="text" placeholder="Order Number" />
          <button>Create Order</button>
        </div>
        
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ORD-001</td>
              <td>Jane Smith</td>
              <td>Pending</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* From Sales_report.css */}
      <div className="report-container">
        <div className="form-card">
          <h3>Sales Report</h3>
          <select>
            <option>All Products</option>
          </select>
          <button>Generate Report</button>
        </div>
      </div>
    </div>
  );
}

// ========================================
// IMPORTANT NOTES FOR OTHER MODULES:
// ========================================

/*
1. ✅ IMPORT THE CSS FILES YOU NEED:
   - Add the import statement at the top of your component
   - Example: import './Module_8style/After_Sales.css';

2. ✅ USE THE ORIGINAL CSS CLASSES:
   - All original class names are available
   - Global styles (button, input, etc.) will work
   - No changes needed to existing code

3. ✅ AVAILABLE CSS FILES:
   - After_Sales.css - For after-sales support styling
   - CM_management.css - For CRM management styling  
   - Sales_order.css - For sales order styling
   - Sales_report.css - For sales reporting styling

4. ✅ BACKWARD COMPATIBILITY:
   - All original styles are preserved
   - No breaking changes
   - Existing modules continue to work

5. ⚠️ IMPORTANT - SALESCUSTOMER MODULE:
   - SalesCustomer components DON'T import these CSS files
   - They use Tailwind classes instead
   - This prevents CSS conflicts

6. 🚀 FUTURE DEVELOPMENT:
   - New modules can choose either approach
   - Gradual migration to Tailwind is possible
   - Both approaches coexist peacefully
*/

export default ExampleOtherModuleComponent;
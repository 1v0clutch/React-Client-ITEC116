// pages/ProcurementPage.js
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import PurchaseRequisition from '../components/PurchaseRequisition';
import SupplierManagement from '../components/SupplierManagement';
import PurchaseOrderManagement from '../components/PurchaseOrderManagement';
import GoodsReceiptInvoice from '../components/GoodsReceiptInvoice';

const ProcurementPage = () => {
  const [activeTab, setActiveTab] = useState("Purchase Requisition");

  const renderTab = () => {
    switch(activeTab) {
      case "Purchase Requisition": return <PurchaseRequisition />;
      case "Supplier Management": return <SupplierManagement />;
      case "Purchase Orders": return <PurchaseOrderManagement />;
      case "Goods Receipt": return <GoodsReceiptInvoice />;
      default: return null;
    }
  }

  return (
    <div>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderTab()}
    </div>
  );
};

export default ProcurementPage;
// components/Navbar.js
import React from 'react';

const Navbar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    "Purchase Requisition",
    "Supplier Management",
    "Purchase Orders",
    "Goods Receipt"
  ];

  return (
    <nav className="bg-blue-600 p-4 text-white flex space-x-6">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`px-3 py-2 rounded ${
            activeTab === tab ? 'bg-white text-blue-600 font-bold' : ''
          }`}
          onClick={() => setActiveTab(tab)}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
};

export default Navbar;

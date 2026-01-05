import React from 'react';

// Test component to verify CSS isolation
function StyleTest() {
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold text-blue-600 mb-4">SalesCustomer CSS Isolation Test</h2>
      
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-800">Test Elements</h3>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">
            Button Test
          </button>
          <input 
            type="text" 
            placeholder="Input Test" 
            className="border border-gray-300 px-3 py-2 rounded"
          />
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-green-800">
            ✅ If this component renders with proper Tailwind styles and doesn't affect other modules, 
            the CSS isolation is working correctly.
          </p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-yellow-800">
            ⚠️ If other modules' styles are broken, there might still be global CSS conflicts.
          </p>
        </div>
      </div>
    </div>
  );
}

export default StyleTest;
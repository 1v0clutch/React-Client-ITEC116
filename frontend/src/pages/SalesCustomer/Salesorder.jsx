import { useState, useEffect } from "react";

function SalesOrderManagement() {
  const [activeTab, setActiveTab] = useState("quotations");
  
  const [customers] = useState([
    { id: 1, name: "Alice Johnson", creditStatus: "Good" },
    { id: 2, name: "Bob Smith", creditStatus: "Overdue" },
  ]);

  const [products, setProducts] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [orders, setOrders] = useState([]);

  const [newQuotation, setNewQuotation] = useState({
    customerId: "",
    productId: "",
    quantity: 1,
    discount: 0,
    tax: 12,
    validUntil: "",
  });

  const [newOrder, setNewOrder] = useState({
    customerId: "",
    productId: "",
    quantity: 1,
    discount: 0,
    tax: 12,
    status: "pending",
  });

  useEffect(() => {
    fetch("http://localhost:8000/api/inventory/getItems")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched products:", data);
        setProducts(data);
      })
      .catch((err) => console.error("Error fetching inventory:", err));

    fetch("http://localhost:8000/api/quotations/all")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched quotations:", data);
        setQuotations(data);
      })
      .catch((err) => console.error("Error fetching quotations:", err));

    fetch("http://localhost:8000/api/sales-orders/all")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched orders:", data);
        setOrders(data);
      })
      .catch((err) => console.error("Error fetching orders:", err));
  }, []);

  const checkCustomerCredit = (customerId) => {
    const customer = customers.find((c) => c.id === parseInt(customerId));
    if (!customer) return alert("Customer not found!");
    alert(`Finance Check: ${customer.name} has ${customer.creditStatus} credit standing.`);
  };

  const calculateTotalAmount = (quantity, discount, tax, basePrice = 100) => {
    const baseAmount = basePrice * quantity;
    const discountAmount = (baseAmount * discount) / 100;
    const taxedAmount = (baseAmount - discountAmount) * (tax / 100);
    return (baseAmount - discountAmount + taxedAmount).toFixed(2);
  };

  const createQuotation = async () => {
    const product = products.find((p) => p._id === newQuotation.productId);
    const customer = customers.find((c) => c.id === parseInt(newQuotation.customerId));

    if (!product || !customer || !newQuotation.validUntil) {
      alert("Please select customer, product, and set valid until date!");
      return;
    }

    const totalAmount = calculateTotalAmount(newQuotation.quantity, newQuotation.discount, newQuotation.tax);

    const quotationData = {
      customerId: parseInt(newQuotation.customerId),
      productId: product._id,
      quantity: newQuotation.quantity,
      discount: newQuotation.discount,
      tax: newQuotation.tax,
      totalAmount: parseFloat(totalAmount),
      validUntil: newQuotation.validUntil,
      status: "draft",
    };

    try {
      const response = await fetch("http://localhost:8000/api/quotations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quotationData),
      });
      const createdQuotation = await response.json();
      setQuotations([...quotations, createdQuotation.quotation]);
      setNewQuotation({
        customerId: "",
        productId: "",
        quantity: 1,
        discount: 0,
        tax: 12,
        validUntil: "",
      });
      alert("Quotation Created Successfully!");
    } catch (error) {
      console.error("Error creating quotation:", error);
      alert("Error creating quotation!");
    }
  };

  const createOrder = async () => {
    const product = products.find((p) => p._id === newOrder.productId);
    const customer = customers.find((c) => c.id === parseInt(newOrder.customerId));

    if (!product || !customer) {
      alert("Please select both customer and product!");
      return;
    }

    if (newOrder.quantity > product.quantity) {
      alert(`Not enough stock! Only ${product.quantity} left in inventory.`);
      return;
    }

    const totalAmount = calculateTotalAmount(newOrder.quantity, newOrder.discount, newOrder.tax);

    const newOrderData = {
      customerId: parseInt(newOrder.customerId),
      productId: product._id,
      quantity: newOrder.quantity,
      discount: newOrder.discount,
      tax: newOrder.tax,
      status: newOrder.status,
      totalAmount: parseFloat(totalAmount),
      invoiceStatus: "unpaid",
    };

    try {
      const response = await fetch("http://localhost:8000/api/sales-orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrderData),
      });
      const createdOrder = await response.json();
      setOrders([...orders, createdOrder.order]);
      setNewOrder({
        customerId: "",
        productId: "",
        quantity: 1,
        discount: 0,
        tax: 12,
        status: "pending",
      });
      alert("Order Created Successfully!");
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Error creating order!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Sales Order & Quotation Management</h2>
            <p className="text-white/80 text-sm">Manage Quotations, Orders & Customer Relations</p>
          </div>
        </div>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-2 border-gray-100">
        <div className="flex gap-4">
          <button
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeTab === "quotations"
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg transform scale-105"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("quotations")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Quotations
          </button>
          <button
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeTab === "orders"
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg transform scale-105"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("orders")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Orders
          </button>
        </div>
      </div>

      {activeTab === "quotations" && (
        <>
          {/* Enhanced Quotation Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-100 hover:border-blue-200 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-2 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Create New Quotation</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex flex-col group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Customer
                </label>
                <select
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 group-hover:border-blue-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                  value={newQuotation.customerId}
                  onChange={(e) => setNewQuotation({ ...newQuotation, customerId: e.target.value })}
                >
                  <option key="select-customer" value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {newQuotation.customerId && (
                  <button
                    onClick={() => checkCustomerCredit(newQuotation.customerId)}
                    className="mt-2 text-sm bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white px-3 py-1 rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    Check Credit
                  </button>
                )}
              </div>

              <div className="flex flex-col group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Product
                </label>
                <select
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 group-hover:border-purple-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                  value={newQuotation.productId}
                  onChange={(e) => setNewQuotation({ ...newQuotation, productId: e.target.value })}
                >
                  <option key="select-product" value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (Stock: {p.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 group-hover:border-pink-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                  value={newQuotation.quantity}
                  onChange={(e) => setNewQuotation({ ...newQuotation, quantity: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex flex-col group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Discount (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 group-hover:border-yellow-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                  value={newQuotation.discount}
                  onChange={(e) => setNewQuotation({ ...newQuotation, discount: parseFloat(e.target.value) })}
                />
              </div>

              <div className="flex flex-col group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Tax (%)
                </label>
                <input
                  type="number"
                  min={0}
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 group-hover:border-green-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                  value={newQuotation.tax}
                  onChange={(e) => setNewQuotation({ ...newQuotation, tax: parseFloat(e.target.value) })}
                />
              </div>

              <div className="flex flex-col group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Valid Until
                </label>
                <input
                  type="date"
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 group-hover:border-indigo-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                  value={newQuotation.validUntil}
                  onChange={(e) => setNewQuotation({ ...newQuotation, validUntil: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button 
                onClick={createQuotation}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Quotation
              </button>
            </div>
          </div>

          {/* Enhanced Quotations List */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Quotations</h3>
                  <p className="text-white/80 text-sm">{quotations.length} quotations</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {quotations.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-xl font-semibold text-gray-500">No quotations yet</p>
                  <p className="text-gray-400 mt-2">Create your first quotation above</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-200">
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">ID</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Customer</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Product</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Quantity</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Total</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Valid Until</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotations.map((q) => (
                        <tr key={q._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                          <td className="py-4 px-4">
                            <span className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                              #{q._id?.slice(-6)}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-medium text-gray-800">
                            {customers.find(c => c.id === q.customerId)?.name || q.customerId}
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {products.find(p => p._id === q.productId)?.name || (typeof q.productId === 'object' ? q.productId?.name || q.productId?._id : q.productId)}
                          </td>
                          <td className="py-4 px-4 text-gray-600">{q.quantity}</td>
                          <td className="py-4 px-4 font-semibold text-green-600">₱{q.totalAmount}</td>
                          <td className="py-4 px-4">
                            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                              {q.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-600">{new Date(q.validUntil).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === "orders" && (
        <>
          {/* Enhanced Order Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-100 hover:border-green-200 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-2 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Create New Order</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex flex-col group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Customer
                </label>
                <select
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 group-hover:border-green-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                  value={newOrder.customerId}
                  onChange={(e) => setNewOrder({ ...newOrder, customerId: e.target.value })}
                >
                  <option key="select-customer-order" value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Product
                </label>
                <select
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 group-hover:border-teal-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                  value={newOrder.productId}
                  onChange={(e) => setNewOrder({ ...newOrder, productId: e.target.value })}
                >
                  <option key="select-product-order" value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (Stock: {p.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 group-hover:border-blue-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                  value={newOrder.quantity}
                  onChange={(e) => setNewOrder({ ...newOrder, quantity: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex flex-col group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Discount (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 group-hover:border-purple-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                  value={newOrder.discount}
                  onChange={(e) => setNewOrder({ ...newOrder, discount: parseFloat(e.target.value) })}
                />
              </div>

              <div className="flex flex-col group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Tax (%)
                </label>
                <input
                  type="number"
                  min={0}
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 group-hover:border-pink-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                  value={newOrder.tax}
                  onChange={(e) => setNewOrder({ ...newOrder, tax: parseFloat(e.target.value) })}
                />
              </div>

              <div className="flex flex-col group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Status
                </label>
                <select
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 group-hover:border-indigo-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                  value={newOrder.status}
                  onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
                >
                  <option key="pending" value="pending">Pending</option>
                  <option key="confirmed" value="confirmed">Confirmed</option>
                  <option key="shipped" value="shipped">Shipped</option>
                  <option key="delivered" value="delivered">Delivered</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button 
                onClick={createOrder}
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Create Order
              </button>
            </div>
          </div>

          {/* Enhanced Orders List */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-green-200 transition-all duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Sales Orders</h3>
                  <p className="text-white/80 text-sm">{orders.length} orders</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="text-xl font-semibold text-gray-500">No orders yet</p>
                  <p className="text-gray-400 mt-2">Create your first order above</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-200">
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">ID</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Customer</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Product</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Quantity</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Total</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                          <td className="py-4 px-4">
                            <span className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                              #{o._id?.slice(-6)}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-medium text-gray-800">
                            {customers.find(c => c.id === o.customerId)?.name || o.customerId}
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {products.find(p => p._id === o.productId)?.name || (typeof o.productId === 'object' ? o.productId?.name || o.productId?._id : o.productId)}
                          </td>
                          <td className="py-4 px-4 text-gray-600">{o.quantity}</td>
                          <td className="py-4 px-4 font-semibold text-green-600">₱{o.totalAmount}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              o.status === 'delivered' ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' :
                              o.status === 'shipped' ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white' :
                              o.status === 'confirmed' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                              'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              o.invoiceStatus === 'paid' ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' :
                              'bg-gradient-to-r from-red-400 to-red-600 text-white'
                            }`}>
                              {o.invoiceStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SalesOrderManagement;
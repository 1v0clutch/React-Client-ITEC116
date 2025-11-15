import { useState, useEffect } from "react";
import "./Module_8style/Sales_order.css";

function SalesOrderManagement() {
  const [activeTab, setActiveTab] = useState("quotations");

  const [customers, setCustomers] = useState([
    { id: 1, name: "Alice Johnson", creditStatus: "Good" },
    { id: 2, name: "Bob Smith", creditStatus: "Overdue" },
  ]);

  const [products, setProducts] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [orders, setOrders] = useState([]);

  // Consolidated state for new/editing quotation
  const initialQuotationState = {
    customerId: "",
    productId: "",
    quantity: 1,
    discount: 0,
    tax: 12,
    validUntil: "",
  };

  const [currentQuotation, setCurrentQuotation] = useState(initialQuotationState);
  const [editingQuotationId, setEditingQuotationId] = useState(null); // Tracks if we are editing an existing quote

  const [newOrder, setNewOrder] = useState({
    customerId: "",
    productId: "",
    quantity: 1,
    discount: 0,
    tax: 12,
    status: "pending",
  });

  useEffect(() => {
    // Fetch products
    fetch("http://localhost:8000/api/inventory/getItems")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched products:", data);
        setProducts(data);
      })
      .catch((err) => console.error("Error fetching inventory:", err));

    // Fetch quotations
    fetch("http://localhost:8000/api/quotations/all")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched quotations:", data);
        setQuotations(data);
      })
      .catch((err) => console.error("Error fetching quotations:", err));

    // Fetch orders
    fetch("http://localhost:8000/api/sales-orders/all")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched orders:", data);
        setOrders(data);
      })
      .catch((err) => console.error("Error fetching orders:", err));
  }, []);

  // Utility to find product price
  const getProductBasePrice = (productId) => {
    return products.find((p) => p._id === productId)?.basePrice || 100; // Assuming 'basePrice' exists on product, default to 100
  };

  // Calculates total amount by applying discount and tax
  const calculateTotalAmount = (quantity, discount, tax, productId) => {
    const basePrice = getProductBasePrice(productId);
    const baseAmount = basePrice * quantity;
    const discountAmount = (baseAmount * discount) / 100;
    const netAmount = baseAmount - discountAmount;
    const taxedAmount = netAmount * (tax / 100);
    return (netAmount + taxedAmount).toFixed(2);
  };

  // Handles both creation and update of a quotation
  const handleQuotationSubmit = async () => {
    const product = products.find((p) => p._id === currentQuotation.productId);
    const customer = customers.find((c) => c.id === parseInt(currentQuotation.customerId));

    if (!product || !customer || !currentQuotation.validUntil) {
      alert("Please select customer, product, and set valid until date!");
      return;
    }

    const totalAmount = calculateTotalAmount(
      currentQuotation.quantity,
      currentQuotation.discount,
      currentQuotation.tax,
      currentQuotation.productId
    );

    const quotationData = {
      customerId: parseInt(currentQuotation.customerId),
      productId: product._id,
      quantity: currentQuotation.quantity,
      discount: currentQuotation.discount,
      tax: currentQuotation.tax,
      totalAmount: parseFloat(totalAmount),
      validUntil: currentQuotation.validUntil,
      status: editingQuotationId ? quotations.find((q) => q._id === editingQuotationId)?.status || "draft" : "draft",
    };

    try {
      if (editingQuotationId) {
        // UPDATE Logic
        const response = await fetch(`http://localhost:8000/api/quotations/update/${editingQuotationId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(quotationData),
        });
        const updatedQuotation = await response.json();
        setQuotations(quotations.map((q) => (q._id === editingQuotationId ? updatedQuotation.quotation : q)));
        cancelEditingQuotation();
        alert("Quotation updated successfully!");
      } else {
        // CREATE Logic
        const response = await fetch("http://localhost:8000/api/quotations/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(quotationData),
        });
        const createdQuotation = await response.json();
        setQuotations([...quotations, createdQuotation.quotation]);
        setCurrentQuotation(initialQuotationState); // Reset form
        alert("Quotation Created Successfully!");
      }
    } catch (error) {
      console.error(`Error ${editingQuotationId ? 'updating' : 'creating'} quotation:`, error);
      alert(`Error ${editingQuotationId ? 'updating' : 'creating'} quotation!`);
    }
  };

  const startEditingQuotation = (quotation) => {
    // Determine product ID value, handling both embedded object and simple string
    const productIdValue = typeof quotation.productId === "object" && quotation.productId !== null ? quotation.productId._id : quotation.productId;
    // Format validUntil date for the input type="date"
    const validUntilValue = quotation.validUntil ? new Date(quotation.validUntil).toISOString().split("T")[0] : "";
    
    setEditingQuotationId(quotation._id);
    setCurrentQuotation({
      customerId: quotation.customerId ? quotation.customerId.toString() : "",
      productId: productIdValue || "",
      quantity: quotation.quantity ?? 1,
      discount: quotation.discount ?? 0,
      tax: quotation.tax ?? 12,
      validUntil: validUntilValue,
    });
  };

  const cancelEditingQuotation = () => {
    setEditingQuotationId(null);
    setCurrentQuotation(initialQuotationState);
  };

  // Existing functions (omitted for brevity, assume they remain unchanged):
  // checkCustomerCredit
  // createOrder
  // convertQuotationToOrder
  // rejectQuotation
  // updateQuotationStatus
  // deleteQuotation
  // updateStatus
  // updateInvoiceStatus
  // deleteOrder
  // generateInvoice

  // --- Omitted functions from original code for brevity of response ---

  // ✅ FINANCE MODULE READ SIMULATION
  const checkCustomerCredit = (customerId) => {
    const customer = customers.find((c) => c.id === parseInt(customerId));
    if (!customer) return alert("Customer not found!");
    alert(`Finance Check: ${customer.name} has ${customer.creditStatus} credit standing.`);
  };

  // Creates a new sales order and deducts the order quantity from inventory stock
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

    const totalAmount = calculateTotalAmount(newOrder.quantity, newOrder.discount, newOrder.tax, newOrder.productId);

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
      await fetch(`http://localhost:8000/api/inventory/updateItem/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: product.quantity - newOrder.quantity }),
      });
      console.log("Stock updated!");

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
      alert("Order Created and Saved!");
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Error creating order!");
    }
  };

  // Converts a selected quotation into a sales order
  const convertQuotationToOrder = async (quotationId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/quotations/convert/${quotationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      const { order, quotation } = await response.json();
      
      setQuotations(quotations.map((q) => (q._id === quotationId ? quotation : q)));
      setOrders([...orders, order]);
      alert("Quotation converted to Order successfully!");
    } catch (error) {
      console.error("Error converting quotation:", error);
      alert("Error converting quotation to order!");
    }
  };

  // Rejects a quotation
  const rejectQuotation = async (quotationId) => {
    try {
      await fetch(`http://localhost:8000/api/quotations/reject/${quotationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      setQuotations(quotations.map((q) => (q._id === quotationId ? { ...q, status: "rejected" } : q)));
      alert("Quotation rejected!");
    } catch (error) {
      console.error("Error rejecting quotation:", error);
      alert("Error rejecting quotation!");
    }
  };

  // Updates the status of a quotation
  const updateQuotationStatus = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:8000/api/quotations/status/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const updatedQuotation = await response.json();
      setQuotations(quotations.map((q) => (q._id === id ? updatedQuotation.quotation : q)));
    } catch (error) {
      console.error("Error updating quotation status:", error);
    }
  };

  // Deletes a quotation
  const deleteQuotation = async (id) => {
    try {
      await fetch(`http://localhost:8000/api/quotations/delete/${id}`, {
        method: "DELETE",
      });
      setQuotations(quotations.filter((q) => q._id !== id));
      alert("Quotation deleted successfully.");
    } catch (error) {
      console.error("Error deleting quotation:", error);
      alert("Error deleting quotation!");
    }
  };

  // Updates the fulfillment status of a sales order
  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:8000/api/sales-orders/status/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const updatedOrder = await response.json();
      setOrders(orders.map((o) => (o._id === id ? updatedOrder.order : o)));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Updates the payment status of an order's invoice
  const updateInvoiceStatus = async (id, invoiceStatus) => {
    try {
      const response = await fetch(`http://localhost:8000/api/sales-orders/invoice-status/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceStatus }),
      });
      const updatedOrder = await response.json();
      setOrders(orders.map((o) => (o._id === id ? updatedOrder.order : o)));
    } catch (error) {
      console.error("Error updating invoice status:", error);
    }
  };

  // Deletes a sales order
  const deleteOrder = async (id) => {
    try {
      await fetch(`http://localhost:8000/api/sales-orders/delete/${id}`, {
        method: "DELETE",
      });
      setOrders(orders.filter((o) => o._id !== id));
      alert(`Order deleted successfully.`);
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Error deleting order!");
    }
  };

  // Generates and displays an invoice summary
  const generateInvoice = (order) => {
    const customer = customers.find((c) => c.id === order.customerId)?.name;
    const product = products.find((p) => p._id === order.productId)?.name;
    alert(`Invoice Generated:\nCustomer: ${customer}\nProduct: ${product}`);
  };

  // --- End of Omitted functions ---

  return (
    <div className="container">
      <h2>Sales Order & Quotation Management</h2>
      
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "quotations" ? "active" : ""}`}
          onClick={() => setActiveTab("quotations")}
        >
          Quotations
        </button>
        <button
          className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </button>
      </div>

      {activeTab === "quotations" && (
        <>
          <div className="form-card">
            <h3>{editingQuotationId ? "Edit Quotation" : "Create New Quotation"}</h3>
            <label>Customer</label>
            <select
              value={currentQuotation.customerId}
              onChange={(e) => setCurrentQuotation({ ...currentQuotation, customerId: e.target.value })}
              disabled={Boolean(editingQuotationId)} // Optionally disable customer change on edit
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <label>Product</label>
            <select
              value={currentQuotation.productId}
              onChange={(e) => setCurrentQuotation({ ...currentQuotation, productId: e.target.value })}
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} (Stock: {p.quantity})
                </option>
              ))}
            </select>

            <label>Quantity</label>
            <input
              type="number"
              min={1}
              value={currentQuotation.quantity}
              onChange={(e) =>
                setCurrentQuotation({ ...currentQuotation, quantity: parseInt(e.target.value) || 1 })
              }
            />

            <label>Discount (%)</label>
            <input
              type="number"
              min={0}
              value={currentQuotation.discount}
              onChange={(e) =>
                setCurrentQuotation({ ...currentQuotation, discount: parseInt(e.target.value) || 0 })
              }
            />

            <label>Tax (%)</label>
            <input
              type="number"
              min={0}
              value={currentQuotation.tax}
              onChange={(e) =>
                setCurrentQuotation({ ...currentQuotation, tax: parseInt(e.target.value) || 0 })
              }
            />

            <label>Valid Until</label>
            <input
              type="date"
              value={currentQuotation.validUntil}
              onChange={(e) =>
                setCurrentQuotation({ ...currentQuotation, validUntil: e.target.value })
              }
            />

            <div className="actions-cell">
              <button onClick={handleQuotationSubmit} className="btn-action">
                {editingQuotationId ? "Update Quotation" : "Create Quotation"}
              </button>
              {editingQuotationId && (
                <button onClick={cancelEditingQuotation} className="btn-delete">
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
          
          {/* Quotation Listing Table */}
          <h3>Quotations</h3>
          {quotations.length === 0 && <p>No quotations yet.</p>}

          {quotations.length > 0 && (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Quote ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Discount (%)</th>
                  <th>Tax (%)</th>
                  <th>Total Amount</th>
                  <th>Valid Until</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map((q) => (
                  <tr key={q._id}>
                    <td>{q._id}</td>
                    <td>{customers.find((c) => c.id === q.customerId)?.name}</td>
                    <td>{products.find((p) => p._id === q.productId)?.name || products.find((p) => p._id === q.productId?._id)?.name}</td>
                    <td>{q.quantity}</td>
                    <td>{q.discount}%</td>
                    <td>{q.tax}%</td>
                    <td>${q.totalAmount}</td>
                    <td>{new Date(q.validUntil).toLocaleDateString()}</td>
                    <td>
                      <select value={q.status} onChange={(e) => updateQuotationStatus(q._id, e.target.value)}>
                        <option value="draft">draft</option>
                        <option value="sent">sent</option>
                        <option value="accepted">accepted</option>
                        <option value="rejected">rejected</option>
                        <option value="expired">expired</option>
                      </select>
                    </td>
                    <td className="actions-cell">
                      <button 
                        onClick={() => startEditingQuotation(q)} 
                        className="btn-action" 
                        disabled={Boolean(q.convertedToOrderId) || q._id === editingQuotationId}
                      >
                        Edit
                      </button>
                      <button onClick={() => convertQuotationToOrder(q._id)} className="btn-action" disabled={q.convertedToOrderId || q.status === "rejected"}>
                        Convert to Order
                      </button>
                      <button onClick={() => rejectQuotation(q._id)} className="btn-delete" disabled={q.status === "rejected" || q.convertedToOrderId}>
                        Reject
                      </button>
                      <button onClick={() => deleteQuotation(q._id)} className="btn-delete">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {activeTab === "orders" && (
        <>
          <div className="form-card">
            <h3>Create New Order</h3>
            <label>Customer</label>
            <select
              value={newOrder.customerId}
              onChange={(e) => setNewOrder({ ...newOrder, customerId: e.target.value })}
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <label>Product</label>
            <select
              value={newOrder.productId}
              onChange={(e) => setNewOrder({ ...newOrder, productId: e.target.value })}
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} (Stock: {p.quantity})
                </option>
              ))}
            </select>

            <label>Quantity</label>
            <input
              type="number"
              min={1}
              value={newOrder.quantity}
              onChange={(e) =>
                setNewOrder({ ...newOrder, quantity: parseInt(e.target.value) })
              }
            />

            <label>Discount (%)</label>
            <input
              type="number"
              min={0}
              value={newOrder.discount}
              onChange={(e) =>
                setNewOrder({ ...newOrder, discount: parseInt(e.target.value) })
              }
            />

            <label>Tax (%)</label>
            <input
              type="number"
              min={0}
              value={newOrder.tax}
              onChange={(e) =>
                setNewOrder({ ...newOrder, tax: parseInt(e.target.value) })
              }
            />

            <button onClick={createOrder}>Create Order</button>
          </div>

          {/* Orders Listing Table */}
          <h3>Orders</h3>
          {orders.length === 0 && <p>No orders yet.</p>}

          {orders.length > 0 && (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Discount (%)</th>
                  <th>Tax (%)</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Invoice Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td>{o._id}</td>
                    <td>{customers.find((c) => c.id === o.customerId)?.name}</td>
                    <td>{products.find((p) => p._id === o.productId)?.name || products.find((p) => p._id === o.productId?._id)?.name}</td>
                    <td>{o.quantity}</td>
                    <td>{o.discount}%</td>
                    <td>{o.tax}%</td>
                    <td>${o.totalAmount}</td>
                    <td>
                      <select value={o.status} onChange={(e) => updateStatus(o._id, e.target.value)}>
                        <option value="pending">pending</option>
                        <option value="processed">processed</option>
                        <option value="shipped">shipped</option>
                        <option value="delivered">delivered</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                    <td>
                      <select value={o.invoiceStatus} onChange={(e) => updateInvoiceStatus(o._id, e.target.value)}>
                        <option value="unpaid">unpaid</option>
                        <option value="paid">paid</option>
                      </select>
                    </td>
                    <td className="actions-cell">
                      <button onClick={() => generateInvoice(o)} className="btn-action">Invoice</button>
                      <button onClick={() => checkCustomerCredit(o.customerId)} className="btn-action">Credit</button>
                      <button onClick={() => deleteOrder(o._id)} className="btn-delete">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

export default SalesOrderManagement;
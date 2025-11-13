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

  // ✅ FINANCE MODULE READ SIMULATION
  // Checks and displays the credit standing of a selected customer from the finance module
  const checkCustomerCredit = (customerId) => {
    const customer = customers.find((c) => c.id === parseInt(customerId));
    if (!customer) return alert("Customer not found!");
    alert(`Finance Check: ${customer.name} has ${customer.creditStatus} credit standing.`);
  };

  // Calculates total amount by applying discount and tax to the base amount (quantity * basePrice)
  const calculateTotalAmount = (quantity, discount, tax, basePrice = 100) => {
    const baseAmount = basePrice * quantity;
    const discountAmount = (baseAmount * discount) / 100;
    const taxedAmount = (baseAmount - discountAmount) * (tax / 100);
    return (baseAmount - discountAmount + taxedAmount).toFixed(2);
  };

  // Creates a new quotation with customer, product, quantity, discount, tax and validity date
  // Posts quotation data to backend and adds it to the quotations list
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

  // Creates a new sales order and deducts the order quantity from inventory stock
  // Validates customer selection, product availability, and stock levels before creating order
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

  // Converts a selected quotation into a sales order by calling the backend conversion endpoint
  // Updates quotation status and adds the new order to the orders list
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

  // Rejects a quotation by updating its status to "rejected" in the backend
  // Prevents further action on the rejected quotation
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

  // Updates the status of a quotation (draft, sent, accepted, rejected, expired)
  // Sends the new status to backend and updates the quotation in the local state
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

  // Deletes a quotation from the system and removes it from the quotations list
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

  // Updates the fulfillment status of a sales order (pending, processed, shipped, delivered, cancelled)
  // Sends the new status to backend and updates the order in the local state
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

  // Updates the payment status of an order's invoice (unpaid or paid)
  // Tracks whether the customer has paid for the order
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

  // Deletes a sales order from the system and removes it from the orders list
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

  // Generates and displays an invoice summary with customer name and product details for a sales order
  const generateInvoice = (order) => {
    const customer = customers.find((c) => c.id === order.customerId)?.name;
    const product = products.find((p) => p._id === order.productId)?.name;
    alert(`Invoice Generated:\nCustomer: ${customer}\nProduct: ${product}`);
  };

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
            <h3>Create New Quotation</h3>
            <label>Customer</label>
            <select
              value={newQuotation.customerId}
              onChange={(e) => setNewQuotation({ ...newQuotation, customerId: e.target.value })}
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <label>Product</label>
            <select
              value={newQuotation.productId}
              onChange={(e) => setNewQuotation({ ...newQuotation, productId: e.target.value })}
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
              value={newQuotation.quantity}
              onChange={(e) =>
                setNewQuotation({ ...newQuotation, quantity: parseInt(e.target.value) })
              }
            />

            <label>Discount (%)</label>
            <input
              type="number"
              min={0}
              value={newQuotation.discount}
              onChange={(e) =>
                setNewQuotation({ ...newQuotation, discount: parseInt(e.target.value) })
              }
            />

            <label>Tax (%)</label>
            <input
              type="number"
              min={0}
              value={newQuotation.tax}
              onChange={(e) =>
                setNewQuotation({ ...newQuotation, tax: parseInt(e.target.value) })
              }
            />

            <label>Valid Until</label>
            <input
              type="date"
              value={newQuotation.validUntil}
              onChange={(e) =>
                setNewQuotation({ ...newQuotation, validUntil: e.target.value })
              }
            />

            <button onClick={createQuotation}>Create Quotation</button>
          </div>
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
        </>
      )}

      {activeTab === "quotations" && (
        <>
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
          <h3>Orders</h3>
          {orders.length === 0 && <p>No orders yet.</p>}
          
          {orders.length > 0 && (
            <div style={{ marginBottom: "10px", padding: "10px", backgroundColor: "#e3f2fd", borderRadius: "5px", border: "1px solid #2196f3" }}>
              <strong>ℹ️ Note:</strong> Orders from E-Commerce customers (Module 6) are marked in blue and integrated automatically.
            </div>
          )}

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
                    <td>
                      {customers.find((c) => c.id === o.customerId)?.name || 
                       <span className="text-blue-600" title="E-Commerce Customer">
                         E-Commerce Customer (ID: {o.customerId})
                       </span>}
                    </td>
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
                      {customers.find((c) => c.id === o.customerId) && (
                        <button onClick={() => checkCustomerCredit(o.customerId)} className="btn-action">Credit</button>
                      )}
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

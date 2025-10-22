import { useState, useEffect } from "react";
import "./Module_8style/Sales_order.css";

function SalesOrderManagement() {
  const [customers, setCustomers] = useState([
    { id: 1, name: "Alice Johnson", creditStatus: "Good" },
    { id: 2, name: "Bob Smith", creditStatus: "Overdue" },
  ]);

  // 🧩 PRODUCTS from Module 1 (Inventory)
  const [products, setProducts] = useState([]);

  // 🧩 Orders
  const [orders, setOrders] = useState([]);

  const [newOrder, setNewOrder] = useState({
    customerId: "",
    productId: "",
    quantity: 1,
    discount: 0,
    tax: 12,
    status: "pending",
  });

  // ✅ FETCH PRODUCTS FROM MODULE 1 (Inventory)
  useEffect(() => {
    fetch("http://localhost:8000/api/inventory/getItems")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched products:", data);
        setProducts(data);
      })
      .catch((err) => console.error("Error fetching inventory:", err));
  }, []);

  // ✅ FINANCE MODULE READ SIMULATION
  const checkCustomerCredit = (customerId) => {
    const customer = customers.find((c) => c.id === parseInt(customerId));
    if (!customer) return alert("Customer not found!");
    alert(`Finance Check: ${customer.name} has ${customer.creditStatus} credit standing.`);
  };

  // ✅ CREATE NEW ORDER (READ + WRITE Integration with Inventory)
  const createOrder = async () => {
    const product = products.find((p) => p._id === newOrder.productId);
    const customer = customers.find((c) => c.id === parseInt(newOrder.customerId));

    if (!product || !customer) {
      alert("Please select both customer and product!");
      return;
    }

    // 🔹 INVENTORY READ (check stock)
    if (newOrder.quantity > product.quantity) {
      alert(`Not enough stock! Only ${product.quantity} left in inventory.`);
      return;
    }

    // For demo, assume price = 100 per item (since backend doesn't have price)
    const basePrice = 100;
    const baseAmount = basePrice * newOrder.quantity;
    const discountAmount = (baseAmount * newOrder.discount) / 100;
    const taxedAmount = (baseAmount - discountAmount) * (newOrder.tax / 100);
    const totalAmount = baseAmount - discountAmount + taxedAmount;

    const newOrderData = {
      id: orders.length + 1,
      customerId: parseInt(newOrder.customerId),
      productId: product._id,
      quantity: newOrder.quantity,
      discount: newOrder.discount,
      tax: newOrder.tax,
      status: newOrder.status,
      totalAmount: totalAmount.toFixed(2),
      invoiceStatus: "unpaid",
    };

    // 🔹 INVENTORY WRITE (deduct stock using API)
    try {
      await fetch(`http://localhost:8000/api/inventory/updateItem/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: product.quantity - newOrder.quantity }),
      });
      alert("Stock updated in Module 1!");
    } catch (error) {
      console.error("Error updating inventory:", error);
    }

    setOrders([...orders, newOrderData]);
    alert("Order/Quotation Created!");
  };

  const updateStatus = (id, status) =>
    setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));

  const updateInvoiceStatus = (id, invoiceStatus) =>
    setOrders(orders.map((o) => (o.id === id ? { ...o, invoiceStatus } : o)));

  const deleteOrder = (id) => {
    setOrders(orders.filter((o) => o.id !== id));
    alert(`Order #${id} deleted.`);
  };

  const generateInvoice = (order) => {
    const customer = customers.find((c) => c.id === order.customerId)?.name;
    const product = products.find((p) => p._id === order.productId)?.name;
    alert(`Invoice Generated:\nCustomer: ${customer}\nProduct: ${product}`);
  };

  return (
    <div className="container">
      <h2>Sales Order Management</h2>

      <div className="form-card">
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

        <button onClick={createOrder}>Create Order / Quotation</button>
      </div>

      <h3>Orders / Quotations</h3>
      {orders.length === 0 && <p>No orders yet.</p>}

      {orders.map((o) => (
        <div key={o.id} className="order-card">
          <p>
            <strong>Order #{o.id}</strong><br />
            Customer: {customers.find((c) => c.id === o.customerId)?.name}<br />
            Product: {products.find((p) => p._id === o.productId)?.name}<br />
            Quantity: {o.quantity}<br />
            Discount: {o.discount}%<br />
            Tax: {o.tax}%<br />
            Status: {o.status}<br />
            Total Amount: ${o.totalAmount}<br />
            Invoice Status: {o.invoiceStatus}
          </p>

          <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}>
            <option value="pending">pending</option>
            <option value="processed">processed</option>
            <option value="shipped">shipped</option>
            <option value="delivered">delivered</option>
          </select>

          <select
            value={o.invoiceStatus}
            onChange={(e) => updateInvoiceStatus(o.id, e.target.value)}
          >
            <option value="unpaid">unpaid</option>
            <option value="paid">paid</option>
          </select>

          <button onClick={() => generateInvoice(o)}>Generate Invoice</button>
          <button onClick={() => checkCustomerCredit(o.customerId)}>Check Credit</button>
          <button onClick={() => deleteOrder(o.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default SalesOrderManagement;

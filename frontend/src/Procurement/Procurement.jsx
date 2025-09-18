import React, { useState } from 'react';

const Procurement = () => {
    // Dummy Data para sa Purchase Requisitions
    const [requisitions, setRequisitions] = useState([
        { id: 'REQ001', item: 'Laptop', quantity: 10, status: 'Pending Approval', requestedBy: 'John Doe' },
        { id: 'REQ002', item: 'Office Chairs', quantity: 50, status: 'Approved', requestedBy: 'Jane Smith' },
        { id: 'REQ003', item: 'Server Rack', quantity: 2, status: 'Rejected', requestedBy: 'Peter Jones' },
    ]);

    // Dummy Data para sa Suppliers
    const [suppliers, setSuppliers] = useState([
        { id: 'SUP001', name: 'Tech Gadgets Inc.', contact: 'tech.inc@email.com', rating: '5/5' },
        { id: 'SUP002', name: 'Office Solutions Corp.', contact: 'office.sol@email.com', rating: '4/5' },
    ]);

    // State para sa form ng Requisition
    const [newItem, setNewItem] = useState('');
    const [newQuantity, setNewQuantity] = useState('');

    const handleAddRequisition = (e) => {
        e.preventDefault(); // Pipigilan nito ang pag-reload ng page
        if (!newItem || !newQuantity) return; // Walang gagawin kung walang laman

        const newId = `REQ${(requisitions.length + 1).toString().padStart(3, '0')}`;
        const newRequisition = {
            id: newId,
            item: newItem,
            quantity: newQuantity,
            status: 'Pending Approval',
            requestedBy: 'Your Name Here'
        };

        setRequisitions([...requisitions, newRequisition]); // Idadagdag ang bagong requisition
        setNewItem(''); // Ibabalik sa default ang input fields
        setNewQuantity('');
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Procurement (Purchasing) Module</h2>
        

            {/* Purchase Requisition and Approval Section */}
            <h3>Purchase Requisitions</h3>
            <form onSubmit={handleAddRequisition}>
                <input
                    type="text"
                    placeholder="Item Name"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    style={{ marginRight: '10px', padding: '5px' }}
                />
                <input
                    type="number"
                    placeholder="Quantity"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    style={{ marginRight: '10px', padding: '5px' }}
                />
                <button type="submit">Add Requisition</button>
            </form>
            <table>
                <thead>
                    <tr>
                        <th>Requisition ID</th>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Status</th>
                        <th>Requested By</th>
                    </tr>
                </thead>
                <tbody>
                    {requisitions.map(req => (
                        <tr key={req.id}>
                            <td>{req.id}</td>
                            <td>{req.item}</td>
                            <td>{req.quantity}</td>
                            <td>{req.status}</td>
                            <td>{req.requestedBy}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <hr style={{ margin: '30px 0' }} />

            {/* Supplier Management Section */}
            <h3>Supplier Management</h3>
            <table>
                <thead>
                    <tr>
                        <th>Supplier ID</th>
                        <th>Name</th>
                        <th>Contact Info</th>
                        <th>Rating</th>
                    </tr>
                </thead>
                <tbody>
                    {suppliers.map(sup => (
                        <tr key={sup.id}>
                            <td>{sup.id}</td>
                            <td>{sup.name}</td>
                            <td>{sup.contact}</td>
                            <td>{sup.rating}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Procurement;
import React, { useEffect, useState } from 'react';
import { 
    getAllInventory, 
    deleteInventory, 
    getAllProducts, 
    getAllWarehouses, 
    createInventory, 
    updateInventory, // <--- 1. Import update function
    transferInventory 
} from '../services/api';
import GenericTable from '../components/GenericTable';
import GenericModal from '../components/GenericModal';

const InventoryList = () => {
    const [inventory, setInventory] = useState([]);
    
    // Dropdown Data
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    // --- STATE FOR "ADD/EDIT" MODAL ---
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingId, setEditingId] = useState(null); // <--- Track Edit Mode
    const [addFormData, setAddFormData] = useState({
        productId: '',
        warehouseId: '',
        quantity: '',
        storageLocation: ''
    });

    // --- STATE FOR "TRANSFER" MODAL ---
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferData, setTransferData] = useState({
        sourceWarehouseId: '',
        destWarehouseId: '',
        productId: '',
        amount: ''
    });

    useEffect(() => {
        loadInventory();
        loadDropdowns();
    }, []);

    const loadInventory = async () => {
        try {
            const result = await getAllInventory();
            setInventory(result.data);
        } catch (error) {
            console.error("Error loading inventory:", error);
        }
    };

    const loadDropdowns = async () => {
        try {
            const pRes = await getAllProducts();
            const wRes = await getAllWarehouses();
            setProducts(pRes.data);
            setWarehouses(wRes.data);
        } catch (error) {
            console.error("Error loading dropdowns:", error);
        }
    };

    // --- HANDLERS FOR ADD/EDIT STOCK ---
    const handleAddInput = (e) => {
        setAddFormData({ ...addFormData, [e.target.name]: e.target.value });
    };

    // New Helper: Prepare form for Editing
    const handleEdit = (item) => {
        setAddFormData({
            productId: item.product.id,       // Extract ID from object
            warehouseId: item.warehouse.id,   // Extract ID from object
            quantity: item.quantity,
            storageLocation: item.storageLocation
        });
        setEditingId(item.id); // Set mode to Edit
        setShowAddModal(true);
    };

    const resetAddForm = () => {
        setAddFormData({ productId: '', warehouseId: '', quantity: '', storageLocation: '' });
        setEditingId(null);
        setShowAddModal(false);
    };

    const handleSaveSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                product: { id: addFormData.productId },
                warehouse: { id: addFormData.warehouseId },
                quantity: parseInt(addFormData.quantity),
                storageLocation: addFormData.storageLocation
            };

            if (editingId) {
                // Update Mode
                await updateInventory(editingId, payload);
                alert("Inventory Updated!");
            } else {
                // Create Mode
                await createInventory(payload);
                alert("Inventory Added!");
            }

            resetAddForm();
            loadInventory();
        } catch (error) {
            console.error("Error saving inventory:", error);
            alert("Failed: " + (error.response?.data?.message || error.message));
        }
    };

    // --- HANDLERS FOR TRANSFERRING STOCK ---
    const handleTransferInput = (e) => {
        setTransferData({ ...transferData, [e.target.name]: e.target.value });
    };

    const handleTransferSubmit = async (e) => {
        e.preventDefault();
        if (transferData.sourceWarehouseId === transferData.destWarehouseId) {
            alert("Source and Destination warehouses cannot be the same!");
            return;
        }

        try {
            const payload = {
                sourceWarehouseId: parseInt(transferData.sourceWarehouseId),
                destWarehouseId: parseInt(transferData.destWarehouseId),
                productId: parseInt(transferData.productId),
                amount: parseInt(transferData.amount)
            };
            await transferInventory(payload);
            alert("Transfer Successful!");
            setShowTransferModal(false);
            setTransferData({ sourceWarehouseId: '', destWarehouseId: '', productId: '', amount: '' });
            loadInventory();
        } catch (error) {
            console.error("Error transferring inventory:", error);
            alert("Transfer Failed: " + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            await deleteInventory(id);
            loadInventory(); 
        }
    };

    const columns = [
        { header: "ID", key: "id" },
        { 
            header: "Product", 
            render: (item) => (
                <div>
                    <strong>{item.product.name}</strong>
                    <div className="small text-muted">{item.product.sku}</div>
                </div>
            )
        },
        { header: "Warehouse", render: (item) => item.warehouse.name },
        { 
            header: "Quantity", 
            render: (item) => <span className={`badge ${item.quantity < 10 ? 'bg-danger' : 'bg-success'}`}>{item.quantity}</span> 
        },
        { header: "Location", key: "storageLocation" }
    ];

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Inventory Management</h2>
                <div>
                    <button className="btn btn-warning me-2" onClick={() => setShowTransferModal(true)}>
                        <i className="bi bi-arrow-left-right"></i> Transfer Stock
                    </button>
                    <button className="btn btn-primary" onClick={() => { resetAddForm(); setShowAddModal(true); }}>
                        + Add New Stock
                    </button>
                </div>
            </div>
            
            <GenericTable 
                data={inventory}
                columns={columns}
                actions={(item) => (
                    <div>
                        <button 
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleEdit(item)}
                        >
                            Edit
                        </button>
                        <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(item.id)}
                        >
                            Delete
                        </button>
                    </div>
                )}
            />

            {/* --- MODAL 1: ADD/EDIT STOCK --- */}
            <GenericModal 
                show={showAddModal} 
                onClose={resetAddForm} 
                title={editingId ? "Edit Inventory Item" : "Add Stock to Warehouse"}
            >
                <form onSubmit={handleSaveSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Product</label>
                        <select className="form-select" name="productId" value={addFormData.productId} onChange={handleAddInput} required>
                            <option value="">Select a Product...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>)}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Warehouse</label>
                        <select className="form-select" name="warehouseId" value={addFormData.warehouseId} onChange={handleAddInput} required>
                            <option value="">Select a Warehouse...</option>
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Quantity</label>
                        <input type="number" className="form-control" name="quantity" value={addFormData.quantity} onChange={handleAddInput} required min="1" />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Storage Location</label>
                        <input type="text" className="form-control" name="storageLocation" value={addFormData.storageLocation} onChange={handleAddInput} required />
                    </div>
                    <div className="d-flex justify-content-end">
                        <button type="button" className="btn btn-secondary me-2" onClick={resetAddForm}>Cancel</button>
                        <button type="submit" className="btn btn-success">
                            {editingId ? "Update Stock" : "Save Stock"}
                        </button>
                    </div>
                </form>
            </GenericModal>

            {/* --- MODAL 2: TRANSFER STOCK --- */}
            <GenericModal show={showTransferModal} onClose={() => setShowTransferModal(false)} title="Transfer Inventory">
                <form onSubmit={handleTransferSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Product to Move</label>
                        <select className="form-select" name="productId" value={transferData.productId} onChange={handleTransferInput} required>
                            <option value="">Select Product...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">From (Source)</label>
                            <select className="form-select" name="sourceWarehouseId" value={transferData.sourceWarehouseId} onChange={handleTransferInput} required>
                                <option value="">Source Warehouse...</option>
                                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">To (Destination)</label>
                            <select className="form-select" name="destWarehouseId" value={transferData.destWarehouseId} onChange={handleTransferInput} required>
                                <option value="">Dest Warehouse...</option>
                                {warehouses.map(w => (
                                    <option key={w.id} value={w.id} disabled={w.id === parseInt(transferData.sourceWarehouseId)}>
                                        {w.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Amount to Move</label>
                        <input type="number" className="form-control" name="amount" value={transferData.amount} onChange={handleTransferInput} required min="1" />
                    </div>

                    <div className="d-flex justify-content-end">
                        <button type="button" className="btn btn-secondary me-2" onClick={() => setShowTransferModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-warning">Transfer Stock</button>
                    </div>
                </form>
            </GenericModal>
        </div>
    );
};

export default InventoryList;
import React, { useEffect, useState } from 'react';
import { 
    getAllInventory, 
    deleteInventory, 
    getAllProducts, 
    getAllWarehouses, 
    createInventory, 
    updateInventory,
    transferInventory 
} from '../services/api';
import GenericTable from '../components/GenericTable';
import GenericModal from '../components/GenericModal';
import useCrudForm from '../hooks/useCrudForm';

const InventoryList = () => {
    const [inventory, setInventory] = useState([]);
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    // --- USE THE HOOK FOR ADD/EDIT ---
    const {
        formData: addFormData,
        editingId,
        showModal: showAddModal,
        handleInputChange: handleAddInput,
        openCreateModal,
        openEditModal: baseOpenEditModal, // Rename the base function
        closeModal: closeAddModal,
        handleSubmit: handleSaveSubmit,
        setFormData
    } = useCrudForm(
        { productId: '', warehouseId: '', quantity: '', storageLocation: '' },
        (data) => createInventory(formatPayload(data)), // Wrapper to format payload on create
        (id, data) => updateInventory(id, formatPayload(data)), // Wrapper to format payload on update
        () => loadInventory()
    );

    // --- HELPER TO FORMAT DATA FOR API ---
    // The API expects nested objects { product: { id: 1 } }, but form uses flat IDs.
    const formatPayload = (data) => ({
        product: { id: data.productId },
        warehouse: { id: data.warehouseId },
        quantity: parseInt(data.quantity),
        storageLocation: data.storageLocation
    });

    // --- CUSTOM EDIT HANDLER ---
    // We need to flatten the nested object before opening the modal
    const handleEditClick = (item) => {
        const flatItem = {
            id: item.id,
            productId: item.product.id,
            warehouseId: item.warehouse.id,
            quantity: item.quantity,
            storageLocation: item.storageLocation
        };
        setFormData(flatItem);
        baseOpenEditModal(flatItem);
    };

    // --- STATE FOR TRANSFER MODAL ---
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferData, setTransferData] = useState({
        sourceWarehouseId: '', destWarehouseId: '', productId: '', amount: ''
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

    // Transfer Logic (Not using crud hook because it's unique)
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
        { header: "Product", render: (item) => <div><strong>{item.product.name}</strong><div className="small text-muted">{item.product.sku}</div></div> },
        { header: "Warehouse", render: (item) => item.warehouse.name },
        { header: "Quantity", render: (item) => <span className={`badge ${item.quantity < 10 ? 'bg-danger' : 'bg-success'}`}>{item.quantity}</span> },
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
                    <button className="btn btn-primary" onClick={openCreateModal}>
                        + Add New Stock
                    </button>
                </div>
            </div>
            
            <GenericTable 
                data={inventory}
                columns={columns}
                actions={(item) => (
                    <div>
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditClick(item)}>
                            Edit
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.id)}>
                            Delete
                        </button>
                    </div>
                )}
            />

            {/* ADD/EDIT MODAL */}
            <GenericModal show={showAddModal} onClose={closeAddModal} title={editingId ? "Edit Inventory Item" : "Add Stock to Warehouse"}>
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
                        <button type="button" className="btn btn-secondary me-2" onClick={closeAddModal}>Cancel</button>
                        <button type="submit" className="btn btn-success">{editingId ? "Update Stock" : "Save Stock"}</button>
                    </div>
                </form>
            </GenericModal>

            {/* TRANSFER MODAL (Kept Manual) */}
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
                                    <option key={w.id} value={w.id} disabled={w.id === parseInt(transferData.sourceWarehouseId)}>{w.name}</option>
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
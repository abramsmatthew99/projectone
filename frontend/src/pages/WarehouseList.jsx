import React, { useEffect, useState } from 'react';
import { getAllWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from '../services/api';
import GenericTable from '../components/GenericTable';
import GenericModal from '../components/GenericModal';

const WarehouseList = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null); // <--- Track Edit Mode

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        maxCapacity: ''
    });

    useEffect(() => {
        loadWarehouses();
    }, []);

    const loadWarehouses = async () => {
        try {
            const response = await getAllWarehouses();
            setWarehouses(response.data);
        } catch (error) {
            console.error("Error loading warehouses:", error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Helper: Fill form for editing
    const handleEdit = (warehouse) => {
        setFormData({
            name: warehouse.name,
            location: warehouse.location,
            maxCapacity: warehouse.maxCapacity
        });
        setEditingId(warehouse.id);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ name: '', location: '', maxCapacity: '' });
        setEditingId(null);
        setShowModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData, maxCapacity: parseInt(formData.maxCapacity) };
            
            if (editingId) {
                // Update Mode
                await updateWarehouse(editingId, payload);
                alert("Warehouse Updated!");
            } else {
                // Create Mode
                await createWarehouse(payload);
                alert("Warehouse Created!");
            }
            
            resetForm();
            loadWarehouses();
        } catch (error) {
            console.error("Error saving warehouse:", error);
            alert("Failed to save warehouse.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure? This will delete ALL inventory inside this warehouse!")) {
            try {
                await deleteWarehouse(id);
                loadWarehouses();
            } catch (error) {
                console.error("Error deleting warehouse:", error);
                alert("Failed to delete warehouse. It might contain inventory.");
            }
        }
    };

    const columns = [
        { header: "ID", key: "id" },
        { header: "Name", render: (w) => <strong>{w.name}</strong> },
        { header: "Location", key: "location" },
        { 
            header: "Max Capacity", 
            render: (w) => <span className="badge bg-info text-dark">{w.maxCapacity}</span> 
        }
    ];

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Warehouse Management</h2>
                <button 
                    className="btn btn-primary"
                    onClick={() => { resetForm(); setShowModal(true); }}
                >
                    + Add New Warehouse
                </button>
            </div>

            <GenericTable 
                columns={columns} 
                data={warehouses}
                actions={(w) => (
                    <div>
                        <button 
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleEdit(w)}
                        >
                            Edit
                        </button>
                        <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(w.id)}
                        >
                            Delete
                        </button>
                    </div>
                )}
            />

            {/* --- MODAL FORM --- */}
            <GenericModal 
                show={showModal} 
                onClose={resetForm} 
                title={editingId ? "Edit Warehouse" : "Add New Warehouse"}
            >
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Warehouse Name</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleInputChange} 
                            required 
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Location</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="location" 
                            value={formData.location} 
                            onChange={handleInputChange} 
                            required 
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Max Capacity</label>
                        <input 
                            type="number" 
                            className="form-control" 
                            name="maxCapacity" 
                            value={formData.maxCapacity} 
                            onChange={handleInputChange} 
                            required 
                            min="1"
                        />
                    </div>
                    <div className="d-flex justify-content-end">
                        <button type="button" className="btn btn-secondary me-2" onClick={resetForm}>Cancel</button>
                        <button type="submit" className="btn btn-success">
                            {editingId ? "Update Warehouse" : "Save Warehouse"}
                        </button>
                    </div>
                </form>
            </GenericModal>
        </div>
    );
};

export default WarehouseList;
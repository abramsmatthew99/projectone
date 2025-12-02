import React, { useEffect, useState } from 'react';
import { getAllWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from '../services/api';
import GenericTable from '../components/GenericTable';
import GenericModal from '../components/GenericModal';
import useCrudForm from '../hooks/useCrudForm'; // Import the new hook

const WarehouseList = () => {
    const [warehouses, setWarehouses] = useState([]);

    const {
        formData,
        editingId,
        showModal,
        handleInputChange,
        openCreateModal,
        openEditModal,
        closeModal,
        handleSubmit
    } = useCrudForm(
        { name: '', location: '', maxCapacity: '' }, // Initial State
        createWarehouse, // Create API
        updateWarehouse, // Update API
        () => loadWarehouses() // On Success Callback
    );

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

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure? This will delete ALL inventory inside this warehouse!")) {
            try {
                await deleteWarehouse(id);
                loadWarehouses();
            } catch (error) {
                console.error("Error deleting warehouse:", error);
                alert("Failed to delete warehouse.");
            }
        }
    };

    const columns = [
        { header: "ID", key: "id" },
        { header: "Name", render: (w) => <strong>{w.name}</strong> },
        { header: "Location", key: "location" },
        { header: "Max Capacity", render: (w) => <span className="badge bg-info text-dark">{w.maxCapacity}</span> }
    ];

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Warehouse Management</h2>
                {/* Simplified Button */}
                <button className="btn btn-primary" onClick={openCreateModal}>
                    + Add New Warehouse
                </button>
            </div>

            <GenericTable 
                columns={columns} 
                data={warehouses}
                actions={(w) => (
                    <div>
                        {/* Simplified Edit Button */}
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEditModal(w)}>
                            Edit
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(w.id)}>
                            Delete
                        </button>
                    </div>
                )}
            />

            {/* Modal uses hook values directly */}
            <GenericModal 
                show={showModal} 
                onClose={closeModal} 
                title={editingId ? "Edit Warehouse" : "Add New Warehouse"}
            >
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Warehouse Name</label>
                        <input 
                            type="text" className="form-control" name="name" 
                            value={formData.name} onChange={handleInputChange} required 
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Location</label>
                        <input 
                            type="text" className="form-control" name="location" 
                            value={formData.location} onChange={handleInputChange} required 
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Max Capacity</label>
                        <input 
                            type="number" className="form-control" name="maxCapacity" 
                            value={formData.maxCapacity} onChange={handleInputChange} required min="1"
                        />
                    </div>
                    <div className="d-flex justify-content-end">
                        <button type="button" className="btn btn-secondary me-2" onClick={closeModal}>Cancel</button>
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
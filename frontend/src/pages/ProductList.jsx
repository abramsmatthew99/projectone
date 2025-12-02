import React, { useEffect, useState } from 'react';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../services/api';
import GenericTable from '../components/GenericTable';
import GenericModal from '../components/GenericModal';
import useCrudForm from '../hooks/useCrudForm';

const ProductList = () => {
    const [products, setProducts] = useState([]);

    // --- USE THE HOOK ---
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
        { name: '', sku: '', description: '' }, // Initial State
        createProduct, // Create API
        updateProduct, // Update API
        () => loadProducts() // On Success Callback
    );

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const response = await getAllProducts();
            setProducts(response.data);
        } catch (error) {
            console.error("Error loading products:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure? This will delete the product and all associated inventory!")) {
            try {
                await deleteProduct(id);
                alert("Product Deleted!");
                loadProducts();
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("Failed to delete product.");
            }
        }
    };

    const columns = [
        { header: "ID", key: "id" },
        { header: "Name", render: (p) => <strong>{p.name}</strong> },
        { header: "SKU", render: (p) => <span className="badge bg-secondary">{p.sku}</span> },
        { header: "Description", key: "description" }
    ];

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Product Catalog</h2>
                <button className="btn btn-primary" onClick={openCreateModal}>
                    + Create New Product
                </button>
            </div>

            <GenericTable 
                columns={columns} 
                data={products}
                actions={(product) => (
                    <div>
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEditModal(product)}>
                            Edit
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(product.id)}>
                            Delete
                        </button>
                    </div>
                )}
            />

            <GenericModal 
                show={showModal} 
                onClose={closeModal} 
                title={editingId ? "Edit Product" : "Add New Product"}
            >
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Product Name</label>
                        <input type="text" className="form-control" name="name" value={formData.name} onChange={handleInputChange} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">SKU</label>
                        <input type="text" className="form-control" name="sku" value={formData.sku} onChange={handleInputChange} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea className="form-control" name="description" rows="3" value={formData.description} onChange={handleInputChange} />
                    </div>
                    <div className="d-flex justify-content-end">
                        <button type="button" className="btn btn-secondary me-2" onClick={closeModal}>Cancel</button>
                        <button type="submit" className="btn btn-success">
                            {editingId ? "Update Product" : "Save Product"}
                        </button>
                    </div>
                </form>
            </GenericModal>
        </div>
    );
};

export default ProductList;
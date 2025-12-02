import React, { useEffect, useState } from 'react';
import { getAllProducts, createProduct, updateProduct, deleteProduct} from '../services/api';
import GenericTable from '../components/GenericTable';
import GenericModal from '../components/GenericModal';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    
    // 2. New State to track which ID we are editing (null = Create Mode)
    const [editingId, setEditingId] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        description: ''
    });

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

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    //for editing rather than creating
    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            sku: product.sku,
            description: product.description || '' // Handle null descriptions safely
        });
        setEditingId(product.id); // Set the ID so we know we are editing
        setShowModal(true);
    };

    // 4. Helper to reset everything when closing/saving
    const resetForm = () => {
        setFormData({ name: '', sku: '', description: '' });
        setEditingId(null); // Reset back to "Create Mode"
        setShowModal(false);
    };

    const handleDelete = async (id) => {
        // Warning: Deleting a product usually cascades to delete its inventory too
        if (window.confirm("Are you sure? This will delete the product and all associated inventory!")) {
            try {
                await deleteProduct(id);
                alert("Product Deleted!");
                loadProducts(); // Refresh the list
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("Failed to delete product. Check console for details.");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // --- UPDATE MODE ---
                await updateProduct(editingId, formData);
                alert("Product Updated!");
            } else {
                // --- CREATE MODE ---
                await createProduct(formData);
                alert("Product Created!");
            }
            
            resetForm();
            loadProducts();
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Failed to save product.");
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
                <button 
                    className="btn btn-primary"
                    onClick={() => {
                        resetForm(); // Ensure we start fresh
                        setShowModal(true);
                    }}
                >
                    + Create New Product
                </button>
            </div>

            <GenericTable 
                columns={columns} 
                data={products}
                actions={(product) => (
                    <div>
                        <button 
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleEdit(product)}
                        >
                            Edit
                        </button>
                        <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(product.id)}
                        >
                            Delete
                        </button>
                    </div>
                )}
            />

            <GenericModal 
                show={showModal} 
                onClose={resetForm} 
                title={editingId ? "Edit Product" : "Add New Product"} // Dynamic Title
            >
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Product Name</label>
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
                        <label className="form-label">SKU</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="sku" 
                            value={formData.sku} 
                            onChange={handleInputChange} 
                            required 
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea 
                            className="form-control" 
                            name="description" 
                            rows="3"
                            value={formData.description} 
                            onChange={handleInputChange} 
                        />
                    </div>
                    <div className="d-flex justify-content-end">
                        <button type="button" className="btn btn-secondary me-2" onClick={resetForm}>Cancel</button>
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
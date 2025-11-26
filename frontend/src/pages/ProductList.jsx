import React, { useEffect, useState } from 'react';
import { getAllProducts, createProduct } from '../services/api';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false); // Toggles the "Add" form
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createProduct(formData);
            alert("Product Created!");
            setShowForm(false); // Hide form
            setFormData({ name: '', sku: '', description: '' }); // Reset form
            loadProducts(); // Refresh list
        } catch (error) {
            console.error("Error creating product:", error);
            alert("Failed to create product.");
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Product Catalog</h2>
                <button 
                    className={`btn ${showForm ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : '+ Create New Product'}
                </button>
            </div>

            {/* THE ADD FORM (Only shows if showForm is true) */}
            {showForm && (
                <div className="card mb-4 p-4 shadow-sm bg-light">
                    <h4>Add New Product</h4>
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-4 mb-3">
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
                            <div className="col-md-4 mb-3">
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
                            <div className="col-md-12 mb-3">
                                <label className="form-label">Description</label>
                                <textarea 
                                    className="form-control" 
                                    name="description" 
                                    rows="2"
                                    value={formData.description} 
                                    onChange={handleInputChange} 
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-success">Save Product</button>
                    </form>
                </div>
            )}

            {/* THE PRODUCT TABLE */}
            <div className="card shadow-sm">
                <table className="table table-striped table-hover mb-0">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>SKU</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p) => (
                            <tr key={p.id}>
                                <td>{p.id}</td>
                                <td><strong>{p.name}</strong></td>
                                <td><span className="badge bg-secondary">{p.sku}</span></td>
                                <td>{p.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductList;
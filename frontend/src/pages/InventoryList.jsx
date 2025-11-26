import React, { useEffect, useState} from 'react';
import { getAllInventory, deleteInventory } from '../services/api';
import { Link } from 'react-router-dom';

const InventoryList = () => {

    const [inventory, setInventory] = useState([]);

    //On component load, load our inventory
    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        try {
            const result = await getAllInventory();
            setInventory(result.data);
        } catch (error) {
            console.error("Error loading inventory:", error);
        }
    }; 

    //Delete confirmation
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this inventory item?")) {
            await deleteInventory(id);
            loadInventory(); //reload
        }
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Inventory Management</h2>
                <button className="btn btn-primary">
                    + Add New Item
                </button>
            </div>
            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <table className="table table-striped table-hover mb-0">
                        <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Product</th>
                                <th>SKU</th>
                                <th>Warehouse</th>
                                <th>Quantity</th>
                                <th>Location</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* LOOP through the data to create rows */}
                            {inventory.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>
                                        <strong>{item.product.name}</strong>
                                    </td>
                                    <td>{item.product.sku}</td>
                                    <td>{item.warehouse.name}</td>
                                    <td>
                                        {/* Logic: If quantity < 10, make badge red. Else green. */}
                                        <span className={`badge ${item.quantity < 10 ? 'bg-danger' : 'bg-success'}`}>
                                            {item.quantity}
                                        </span>
                                    </td>
                                    <td>{item.storageLocation}</td>
                                    <td className="text-end">
                                        <button 
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
        </div>
    );
};

export default InventoryList;
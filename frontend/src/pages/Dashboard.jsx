import React, { useEffect, useState } from 'react';
import { getAllWarehouses, getAllInventory } from '../services/api';

const Dashboard = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const warehouseRes = await getAllWarehouses();
            const inventoryRes = await getAllInventory();
            setWarehouses(warehouseRes.data);
            setInventory(inventoryRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            setLoading(false);
        }
    };

    // Helper to calculate current load for a specific warehouse
    const calculateLoad = (warehouseId) => {
        return inventory
            .filter(item => item.warehouse.id === warehouseId)
            .reduce((sum, item) => sum + item.quantity, 0);
    };

    if (loading) return <div className="text-center mt-5">Loading Dashboard...</div>;

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Dashboard Overview</h2>

            {/* Top Stats Row */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card text-white bg-primary mb-3">
                        <div className="card-header">Total Warehouses</div>
                        <div className="card-body">
                            <h5 className="card-title display-4">{warehouses.length}</h5>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-white bg-success mb-3">
                        <div className="card-header">Total Inventory Items</div>
                        <div className="card-body">
                            <h5 className="card-title display-4">
                                {inventory.reduce((sum, item) => sum + item.quantity, 0)}
                            </h5>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-white bg-info mb-3">
                        <div className="card-header">Active Products</div>
                        <div className="card-body">
                            {/* Uses Set to count unique product IDs */}
                            <h5 className="card-title display-4">
                                {new Set(inventory.map(i => i.product.id)).size}
                            </h5>
                        </div>
                    </div>
                </div>
            </div>

            {/* Warehouse Capacity Section */}
            <h3>Warehouse Capacity</h3>
            <div className="row">
                {warehouses.map(warehouse => {
                    const currentLoad = calculateLoad(warehouse.id);
                    const percentage = Math.round((currentLoad / warehouse.maxCapacity) * 100);
                    let progressBarColor = "bg-success";
                    if (percentage > 70) progressBarColor = "bg-warning";
                    if (percentage > 90) progressBarColor = "bg-danger";

                    return (
                        <div className="col-md-6 mb-4" key={warehouse.id}>
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">{warehouse.name}</h5>
                                    <h6 className="card-subtitle mb-2 text-muted">{warehouse.location}</h6>
                                    
                                    <p className="mt-3 mb-1">
                                        Capacity: {currentLoad} / {warehouse.maxCapacity}
                                    </p>
                                    <div className="progress" style={{ height: "25px" }}>
                                        <div 
                                            className={`progress-bar ${progressBarColor}`} 
                                            role="progressbar" 
                                            style={{ width: `${percentage}%` }}
                                            aria-valuenow={percentage} 
                                            aria-valuemin="0" 
                                            aria-valuemax="100"
                                        >
                                            {percentage}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Dashboard;
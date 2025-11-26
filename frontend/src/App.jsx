import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; 

import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import InventoryList from './pages/InventoryList';

// Placeholders 
const WarehouseList = () => <h2 className="text-center mt-5">Warehouse List Coming Soon</h2>;

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<ProductList/>} />
          <Route path="/inventory" element={<InventoryList />} />
          <Route path="/warehouses" element={<WarehouseList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
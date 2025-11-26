import axios from 'axios';

const API_URL = 'http://10.0.0.159:8080/api';

// Create an Axios instance (like a dedicated browser for your API)
const api = axios.create({
    baseURL: API_URL,
});

// Define our API calls cleanly
export const getAllWarehouses = () => api.get('/warehouses');
export const createWarehouse = (warehouse) => api.post('/warehouses', warehouse);
export const deleteWarehouse = (id) => api.delete(`/warehouses/${id}`);
export const updateWarehouse = (id, data) => api.put(`/warehouses/${id}`, data);

export const getAllProducts = () => api.get('/products');
export const createProduct = (product) => api.post('/products', product);

export const getAllInventory = () => api.get('/inventory');
export const createInventory = (item) => api.post('/inventory', item);
export const updateInventory = (id, item) => api.put(`/inventory/${id}`, item);
export const deleteInventory = (id) => api.delete(`/inventory/${id}`);

export const transferInventory = (data) => api.post('/inventory/transfer', data);

export default api;
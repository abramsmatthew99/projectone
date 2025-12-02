import axios from 'axios';

const API_URL = 'http://10.0.0.159:8080/api';

const api = axios.create({
    baseURL: API_URL,
});

export const getAllWarehouses = () => api.get('/warehouses');
export const createWarehouse = (warehouse) => api.post('/warehouses', warehouse);
export const deleteWarehouse = (id) => api.delete(`/warehouses/${id}`);
export const updateWarehouse = (id, data) => api.put(`/warehouses/${id}`, data);

export const getAllProducts = () => api.get('/products');
export const createProduct = (product) => api.post('/products', product);
export const updateProduct = (id, product) => api.put(`/products/${id}`, product);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

export const getAllInventory = () => api.get('/inventory');
export const createInventory = (item) => api.post('/inventory', item);
export const updateInventory = (id, item) => api.put(`/inventory/${id}`, item);
export const deleteInventory = (id) => api.delete(`/inventory/${id}`);

export const transferInventory = (data) => api.post('/inventory/transfer', data);

export default api;
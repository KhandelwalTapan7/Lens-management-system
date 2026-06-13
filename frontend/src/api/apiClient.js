import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Orders
export const fetchOrders = (params = {}) => apiClient.get('/orders', { params });
export const fetchOrderById = (id) => apiClient.get(`/orders/${id}`);
export const createOrder = (data) => apiClient.post('/orders', data);
export const updateOrderStatus = (id, data) => apiClient.patch(`/orders/${id}/status`, data);
export const cancelOrder = (id, data) => apiClient.patch(`/orders/${id}/cancel`, data);

// Inventory
export const fetchInventory = (params = {}) => apiClient.get('/inventory', { params });
export const upsertInventory = (data) => apiClient.post('/inventory', data);
export const checkAvailability = (data) => apiClient.post('/inventory/check-availability', data);
export const deleteInventory = (id) => apiClient.delete(`/inventory/${id}`);

// Dashboard
export const fetchDashboard = (params = {}) => apiClient.get('/dashboard', { params });

// Alerts
export const triggerBreachScan = () => apiClient.post('/alerts/scan');

export default apiClient;

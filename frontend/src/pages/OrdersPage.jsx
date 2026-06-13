import React, { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { fetchOrders } from '../api/apiClient';
import OrderForm from '../components/Orders/OrderForm';
import OrderDetail from '../components/Orders/OrderDetail';
import StatusFilter from '../components/Dashboard/StatusFilter';
import Loader from '../components/common/Loader';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    fetchOrders(filters)
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2>All Orders</h2>
        <button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Hide Form' : '+ New Order'}</button>
      </div>

      {showForm && (
        <OrderForm
          onCreated={() => {
            load();
          }}
        />
      )}

      <div className="card">
        <StatusFilter filters={filters} onChange={setFilters} />
        {loading ? (
          <Loader />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Lens Type</th>
                <th>Store</th>
                <th>Status</th>
                <th>Source</th>
                <th>Price</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>{o.orderNumber}</td>
                  <td>{o.customer?.name}</td>
                  <td>{o.lensType?.replace(/_/g, ' ')}</td>
                  <td>{o.storeLocation}</td>
                  <td><span className="badge status">{o.currentStatus?.replace(/_/g, ' ')}</span></td>
                  <td>{o.source}</td>
                  <td>₹{o.price}</td>
                  <td><Link to={`/orders/${o._id}`}>View</Link></td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: '#888' }}>No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const OrdersPage = () => (
  <Routes>
    <Route index element={<OrdersList />} />
    <Route path=":id" element={<div className="container"><OrderDetail /></div>} />
  </Routes>
);

export default OrdersPage;

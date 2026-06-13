import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchOrderById } from '../../api/apiClient';
import Loader from '../common/Loader';

const OrderDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderById(id)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (!data) return <p>Order not found.</p>;

  const { order, statusLogs } = data;

  return (
    <div className="card">
      <Link to="/orders">← Back to Orders</Link>
      <h2>Order {order.orderNumber}</h2>

      <div className="form-grid">
        <div>
          <strong>Customer:</strong> {order.customer.name} ({order.customer.phone})
        </div>
        <div>
          <strong>Store:</strong> {order.storeLocation}
        </div>
        <div>
          <strong>Lens:</strong> {order.lensType.replace(/_/g, ' ')} | Index {order.lensIndex}
        </div>
        <div>
          <strong>Coatings:</strong> {order.coatings.join(', ') || 'None'}
        </div>
        <div>
          <strong>Frame:</strong> {order.frameModel} ({order.frameColor})
        </div>
        <div>
          <strong>Availability:</strong> {order.lensAvailability.replace(/_/g, ' ')}
        </div>
        <div>
          <strong>Current Status:</strong> {order.currentStatus.replace(/_/g, ' ')}
        </div>
        <div>
          <strong>SLA Deadline:</strong> {new Date(order.slaDeadline).toLocaleString()}
        </div>
        <div>
          <strong>Predicted Breach Risk:</strong> {Math.round((order.predictedBreachRisk || 0) * 100)}%
        </div>
        <div>
          <strong>Re-order Count:</strong> {order.reorderCount}
        </div>
      </div>

      <h3 style={{ marginTop: '20px' }}>Status History</h3>
      <table>
        <thead>
          <tr>
            <th>From</th>
            <th>To</th>
            <th>Changed By</th>
            <th>Time in Previous Status</th>
            <th>Reason for Delay</th>
            <th>When</th>
          </tr>
        </thead>
        <tbody>
          {statusLogs.map((log) => (
            <tr key={log._id}>
              <td>{log.fromStatus?.replace(/_/g, ' ') || '-'}</td>
              <td>{log.toStatus.replace(/_/g, ' ')}</td>
              <td>{log.changedBy}</td>
              <td>{log.timeInPreviousStatusMinutes != null ? `${log.timeInPreviousStatusMinutes} min` : '-'}</td>
              <td>{log.reasonForDelay || '-'}</td>
              <td>{new Date(log.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderDetail;

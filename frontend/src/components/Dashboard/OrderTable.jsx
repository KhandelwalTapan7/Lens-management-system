import React, { useState } from 'react';
import SLATimer from './SLATimer';
import BreachBadge from './BreachBadge';
import StatusUpdateModal from '../Orders/StatusUpdateModal';

const OrderTable = ({ orders, onStatusUpdated }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Order #</th>
            <th>Customer</th>
            <th>Lens Type</th>
            <th>Store</th>
            <th>Status</th>
            <th>Availability</th>
            <th>SLA</th>
            <th>AI Breach Risk</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>{o.orderNumber}</td>
              <td>{o.customer?.name}</td>
              <td>{o.lensType?.replace(/_/g, ' ')}</td>
              <td>{o.storeLocation}</td>
              <td>
                <span className="badge status">{o.currentStatus?.replace(/_/g, ' ')}</span>
              </td>
              <td>{o.lensAvailability?.replace(/_/g, ' ')}</td>
              <td>
                <SLATimer remainingHours={o.remainingHours} isBreached={o.isBreached} />
              </td>
              <td>
                <BreachBadge riskScore={o.predictedBreachRisk} />
              </td>
              <td>
                <button onClick={() => setSelectedOrder(o)}>Update</button>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={9} style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                No orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedOrder && (
        <StatusUpdateModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdated={() => {
            setSelectedOrder(null);
            onStatusUpdated?.();
          }}
        />
      )}
    </>
  );
};

export default OrderTable;

import React, { useState } from 'react';
import { ORDER_STATUSES } from '../../utils/constants';
import { updateOrderStatus } from '../../api/apiClient';

/**
 * Modal for updating an order's status. If the new status implies a delay
 * (i.e. user is moving to QC_FAILED_REORDER or any status out of normal flow),
 * a reason can/must be logged.
 */
const StatusUpdateModal = ({ order, onClose, onUpdated }) => {
  const [newStatus, setNewStatus] = useState(order.currentStatus);
  const [reasonForDelay, setReasonForDelay] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await updateOrderStatus(order._id, {
        newStatus,
        changedBy: 'ops-team',
        reasonForDelay: reasonForDelay || null,
        note: note || null,
      });
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>Update Order {order.orderNumber}</h3>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>New Status</label>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Reason for Delay (if any)</label>
            <input
              type="text"
              value={reasonForDelay}
              onChange={(e) => setReasonForDelay(e.target.value)}
              placeholder="e.g. Lens out of stock, awaiting procurement"
            />
          </div>

          <div className="field">
            <label>Note</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
          </div>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={onClose} style={{ background: '#999' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusUpdateModal;

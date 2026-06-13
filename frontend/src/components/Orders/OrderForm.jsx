import React, { useState } from 'react';
import { LENS_TYPES, LENS_INDICES, COATINGS, ORDER_SOURCES, STORE_LOCATIONS } from '../../utils/constants';
import { createOrder } from '../../api/apiClient';

const initialForm = {
  orderNumber: '',
  customer: { name: '', phone: '', email: '' },
  source: 'STORE',
  storeLocation: 'JAIPUR',
  lensType: 'SINGLE_VISION',
  lensIndex: '1.56',
  coatings: [],
  frameModel: '',
  frameColor: '',
  price: '',
  prescription: {
    rightEye: { sph: 0, cyl: 0, axis: 0, add: 0 },
    leftEye: { sph: 0, cyl: 0, axis: 0, add: 0 },
    pd: 60,
  },
};

const OrderForm = ({ onCreated }) => {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const updateField = (path, value) => {
    setForm((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = copy;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  const toggleCoating = (coating) => {
    setForm((prev) => {
      const has = prev.coatings.includes(coating);
      return {
        ...prev,
        coatings: has ? prev.coatings.filter((c) => c !== coating) : [...prev.coatings, coating],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setResult(null);
    try {
      const payload = { ...form, price: Number(form.price) };
      const res = await createOrder(payload);
      setResult(res.data);
      setForm({ ...initialForm, orderNumber: '' });
      onCreated?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h3>Create New Order</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field">
            <label>Order Number</label>
            <input
              required
              value={form.orderNumber}
              onChange={(e) => updateField('orderNumber', e.target.value)}
              placeholder="ORD-1001"
            />
          </div>
          <div className="field">
            <label>Customer Name</label>
            <input
              required
              value={form.customer.name}
              onChange={(e) => updateField('customer.name', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Customer Phone</label>
            <input
              required
              value={form.customer.phone}
              onChange={(e) => updateField('customer.phone', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Customer Email</label>
            <input
              type="email"
              value={form.customer.email}
              onChange={(e) => updateField('customer.email', e.target.value)}
            />
          </div>

          <div className="field">
            <label>Source</label>
            <select value={form.source} onChange={(e) => updateField('source', e.target.value)}>
              {ORDER_SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Store Location</label>
            <select value={form.storeLocation} onChange={(e) => updateField('storeLocation', e.target.value)}>
              {STORE_LOCATIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Lens Type</label>
            <select value={form.lensType} onChange={(e) => updateField('lensType', e.target.value)}>
              {LENS_TYPES.map((l) => (
                <option key={l} value={l}>{l.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Lens Index</label>
            <select value={form.lensIndex} onChange={(e) => updateField('lensIndex', e.target.value)}>
              {LENS_INDICES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Frame Model</label>
            <input required value={form.frameModel} onChange={(e) => updateField('frameModel', e.target.value)} />
          </div>

          <div className="field">
            <label>Frame Color</label>
            <input value={form.frameColor} onChange={(e) => updateField('frameColor', e.target.value)} />
          </div>

          <div className="field">
            <label>Price (₹)</label>
            <input
              required
              type="number"
              value={form.price}
              onChange={(e) => updateField('price', e.target.value)}
            />
          </div>
        </div>

        <div className="field" style={{ marginTop: '10px' }}>
          <label>Coatings</label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {COATINGS.map((c) => (
              <label key={c} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'normal' }}>
                <input type="checkbox" checked={form.coatings.includes(c)} onChange={() => toggleCoating(c)} />
                {c.replace(/_/g, ' ')}
              </label>
            ))}
          </div>
        </div>

        <h4 style={{ marginTop: '16px' }}>Prescription</h4>
        <div className="form-grid">
          {['rightEye', 'leftEye'].map((eye) => (
            <div key={eye}>
              <strong>{eye === 'rightEye' ? 'Right Eye (OD)' : 'Left Eye (OS)'}</strong>
              {['sph', 'cyl', 'axis', 'add'].map((field) => (
                <div className="field" key={field}>
                  <label>{field.toUpperCase()}</label>
                  <input
                    type="number"
                    step="0.25"
                    value={form.prescription[eye][field]}
                    onChange={(e) => updateField(`prescription.${eye}.${field}`, Number(e.target.value))}
                  />
                </div>
              ))}
            </div>
          ))}
          <div className="field">
            <label>PD (mm)</label>
            <input
              type="number"
              value={form.prescription.pd}
              onChange={(e) => updateField('prescription.pd', Number(e.target.value))}
            />
          </div>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {result && (
          <p style={{ color: 'green' }}>
            Order created! Lens availability: <strong>{result.lensAvailability.availability}</strong>
            {result.lensAvailability.estimatedLeadDays > 0 &&
              ` (est. ${result.lensAvailability.estimatedLeadDays} days procurement)`}
          </p>
        )}

        <button type="submit" disabled={submitting} style={{ marginTop: '12px' }}>
          {submitting ? 'Creating...' : 'Create Order'}
        </button>
      </form>
    </div>
  );
};

export default OrderForm;

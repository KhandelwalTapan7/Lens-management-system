import React, { useEffect, useState } from 'react';
import { fetchInventory, upsertInventory, deleteInventory } from '../../api/apiClient';
import { LENS_TYPES, LENS_INDICES, COATINGS } from '../../utils/constants';
import Loader from '../common/Loader';

const emptyForm = {
  lensType: 'SINGLE_VISION',
  lensIndex: '1.56',
  coating: 'ANTI_REFLECTIVE',
  sphMin: -6,
  sphMax: 6,
  cylMin: -2,
  cylMax: 2,
  stockQuantity: 10,
  avgProcurementDays: 3,
};

const InventoryStatus = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    fetchInventory()
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await upsertInventory(form);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteInventory(id);
    load();
  };

  return (
    <div>
      <div className="card">
        <h3>Add / Update Inventory (based on past stocking data)</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label>Lens Type</label>
              <select value={form.lensType} onChange={(e) => handleChange('lensType', e.target.value)}>
                {LENS_TYPES.map((l) => (
                  <option key={l} value={l}>{l.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Lens Index</label>
              <select value={form.lensIndex} onChange={(e) => handleChange('lensIndex', e.target.value)}>
                {LENS_INDICES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Coating</label>
              <select value={form.coating} onChange={(e) => handleChange('coating', e.target.value)}>
                {COATINGS.map((c) => (
                  <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>SPH Min</label>
              <input type="number" value={form.sphMin} onChange={(e) => handleChange('sphMin', Number(e.target.value))} />
            </div>
            <div className="field">
              <label>SPH Max</label>
              <input type="number" value={form.sphMax} onChange={(e) => handleChange('sphMax', Number(e.target.value))} />
            </div>
            <div className="field">
              <label>CYL Min</label>
              <input type="number" value={form.cylMin} onChange={(e) => handleChange('cylMin', Number(e.target.value))} />
            </div>
            <div className="field">
              <label>CYL Max</label>
              <input type="number" value={form.cylMax} onChange={(e) => handleChange('cylMax', Number(e.target.value))} />
            </div>
            <div className="field">
              <label>Stock Quantity</label>
              <input type="number" value={form.stockQuantity} onChange={(e) => handleChange('stockQuantity', Number(e.target.value))} />
            </div>
            <div className="field">
              <label>Avg Procurement Days (if not in stock)</label>
              <input type="number" value={form.avgProcurementDays} onChange={(e) => handleChange('avgProcurementDays', Number(e.target.value))} />
            </div>
          </div>
          <button type="submit" disabled={submitting} style={{ marginTop: '10px' }}>
            {submitting ? 'Saving...' : 'Save Inventory Entry'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Current Inventory</h3>
        {loading ? (
          <Loader />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Lens Type</th>
                <th>Index</th>
                <th>Coating</th>
                <th>SPH Range</th>
                <th>CYL Range</th>
                <th>Stock Qty</th>
                <th>Procurement Days</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>{item.lensType.replace(/_/g, ' ')}</td>
                  <td>{item.lensIndex}</td>
                  <td>{item.coating.replace(/_/g, ' ')}</td>
                  <td>{item.sphMin} to {item.sphMax}</td>
                  <td>{item.cylMin} to {item.cylMax}</td>
                  <td>{item.stockQuantity}</td>
                  <td>{item.avgProcurementDays}</td>
                  <td>
                    <button onClick={() => handleDelete(item._id)} style={{ background: '#e63946' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: '#888' }}>No inventory entries yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InventoryStatus;

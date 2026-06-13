import React from 'react';
import { ORDER_STATUSES, LENS_TYPES, STORE_LOCATIONS } from '../../utils/constants';

const StatusFilter = ({ filters, onChange }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="filters">
      <select value={filters.status || ''} onChange={(e) => handleChange('status', e.target.value)}>
        <option value="">All Statuses</option>
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.replace(/_/g, ' ')}
          </option>
        ))}
      </select>

      <select value={filters.lensType || ''} onChange={(e) => handleChange('lensType', e.target.value)}>
        <option value="">All Lens Types</option>
        {LENS_TYPES.map((l) => (
          <option key={l} value={l}>
            {l.replace(/_/g, ' ')}
          </option>
        ))}
      </select>

      <select value={filters.storeLocation || ''} onChange={(e) => handleChange('storeLocation', e.target.value)}>
        <option value="">All Stores</option>
        {STORE_LOCATIONS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
};

export default StatusFilter;

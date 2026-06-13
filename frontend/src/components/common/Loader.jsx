import React from 'react';

const Loader = ({ text = 'Loading...' }) => (
  <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>{text}</div>
);

export default Loader;

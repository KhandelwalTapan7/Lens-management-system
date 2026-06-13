import React from 'react';

/**
 * Shows AI-predicted breach risk percentage as a badge.
 */
const BreachBadge = ({ riskScore }) => {
  const pct = Math.round((riskScore || 0) * 100);

  let className = 'badge ok';
  if (pct >= 60) className = 'badge breached';
  else if (pct >= 35) className = 'badge at-risk';

  return <span className={className}>{pct}% risk</span>;
};

export default BreachBadge;

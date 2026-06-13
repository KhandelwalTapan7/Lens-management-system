import React from 'react';

/**
 * Displays time remaining against SLA, color-coded.
 */
const SLATimer = ({ remainingHours, isBreached }) => {
  if (isBreached) {
    return <span className="badge breached">Breached ({Math.abs(remainingHours)}h over)</span>;
  }
  if (remainingHours <= 6) {
    return <span className="badge at-risk">{remainingHours}h left</span>;
  }
  return <span className="badge ok">{remainingHours}h left</span>;
};

export default SLATimer;

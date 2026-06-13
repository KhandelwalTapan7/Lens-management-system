// Order lifecycle stages
export const ORDER_STATUSES = [
  'ORDER_PLACED',
  'PRESCRIPTION_VERIFIED',
  'LENS_SOURCING',     // in-house or external procurement
  'LENS_CUTTING',
  'FITTING_ASSEMBLY',
  'QUALITY_CHECK',
  'QC_FAILED_REORDER',
  'PACKED',
  'DISPATCHED',
  'DELIVERED',
  'CANCELLED',
];

// Lens types and their SLA (in hours) from order placement to delivery
export const LENS_SLA_HOURS = {
  SINGLE_VISION: 48,
  BIFOCAL: 72,
  PROGRESSIVE: 96,
  ZERO_POWER: 24,
  CONTACT_LENS: 24,
};

export const LENS_INDICES = ['1.50', '1.56', '1.59', '1.61', '1.67', '1.74'];

export const COATINGS = [
  'ANTI_REFLECTIVE',
  'BLUE_CUT',
  'PHOTOCHROMIC',
  'SCRATCH_RESISTANT',
  'UV_PROTECTION',
];

export const ORDER_SOURCES = ['WEBSITE', 'STORE', 'MARKETPLACE', 'APP'];

// Statuses considered "active" (not yet delivered/cancelled)
export const ACTIVE_STATUSES = ORDER_STATUSES.filter(
  (s) => !['DELIVERED', 'CANCELLED'].includes(s)
);

// Breach risk thresholds (fraction of SLA time consumed)
export const BREACH_RISK_THRESHOLD = 0.75; // 75% of SLA time used and not delivered = at-risk

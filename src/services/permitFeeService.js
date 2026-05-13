/**
 * Fee calculation rules per permit type.
 * ASSUMPTION [B-A02]: Rules are hardcoded. Production would use a DB config table.
 */
const FEE_RULES = {
  construction_permit: (formData) => {
    const base = 5000;
    const sqft = Number(formData.area_sqft) || 0;
    return base + Math.floor(sqft / 100) * 500; // PKR 500 per 100 sqft
  },
  event_permit: (formData) => {
    const crowds = { small: 2000, medium: 5000, large: 10000 };
    return crowds[formData.crowd_size_category] ?? 5000;
  },
  business_license_renewal: () => 3500, // Flat fee
};

function calculateFee(permitType, formData) {
  const calculator = FEE_RULES[permitType];
  return calculator ? calculator(formData) : 0;
}

function getPermitTypes() {
  return [
    {
      type: 'construction_permit',
      label: 'Construction Permit',
      description: 'Required for any new construction or major renovation.',
      baseFee: 5000,
      feeNote: 'PKR 5,000 base + PKR 500 per 100 sqft',
      requiredDocuments: ['Site plan', 'Ownership proof', 'NOC from neighbors'],
    },
    {
      type: 'event_permit',
      label: 'Event Permit',
      description: 'Required for public gatherings and events.',
      baseFee: 2000,
      feeNote: 'Small: PKR 2,000 | Medium: PKR 5,000 | Large: PKR 10,000',
      requiredDocuments: ['Event plan', 'Venue agreement', 'Security plan'],
    },
    {
      type: 'business_license_renewal',
      label: 'Business License Renewal',
      description: 'Annual renewal of existing business operating license.',
      baseFee: 3500,
      feeNote: 'Flat fee: PKR 3,500',
      requiredDocuments: ['Existing license copy', 'Tax clearance certificate'],
    },
  ];
}

module.exports = { calculateFee, getPermitTypes };

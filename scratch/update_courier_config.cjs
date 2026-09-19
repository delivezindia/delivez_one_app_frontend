const fs = require('fs');
const path = require('path');

const targetPath = 'C:/Users/Rax/Desktop/Delivery_app_site_backend/src/modules/personal-courier/courier-config.ts';
const scratchCopyPath = path.join(__dirname, 'backend', 'courier-config.ts');

const newDefinitions = `
// ============================================================================
// COMPREHENSIVE COURIER DELIVERY SPECIFICATIONS (Matching Mobile Flutter App)
// ============================================================================

// 1. Package Content Categories (8 categories from Screen 1)
export const courierPackageCategories = Object.freeze([
  {
    id: 'DOCUMENTS',
    apiCode: 'DOCUMENTS',
    title: 'Documents',
    subtitle: 'Papers, files, certificates, books, etc.',
    icon: 'description_outlined',
    bgColor: '#FFF9E6',
    bgColorHex: '0xFFFFF9E6',
    iconColor: '#D97706',
    iconColorHex: '0xFFD97706',
  },
  {
    id: 'ELECTRONICS',
    apiCode: 'ELECTRONICS',
    title: 'Electronics',
    subtitle: 'Mobile, laptop, gadgets, accessories, etc.',
    icon: 'smartphone_outlined',
    bgColor: '#FFF1F2',
    bgColorHex: '0xFFFFF1F2',
    iconColor: '#E11D48',
    iconColorHex: '0xFFE11D48',
  },
  {
    id: 'CLOTHING_APPAREL',
    apiCode: 'CLOTHING_APPAREL',
    title: 'Clothing & Apparel',
    subtitle: 'Clothes, shoes, cap, fashion items, etc.',
    icon: 'checkroom_outlined',
    bgColor: '#EEF2FF',
    bgColorHex: '0xFFEEF2FF',
    iconColor: '#4F46E5',
    iconColorHex: '0xFF4F46E5',
  },
  {
    id: 'GIFTS_TOYS',
    apiCode: 'GIFTS_TOYS',
    title: 'Gifts & Toys',
    subtitle: 'Gift items, toys, decorative items, etc.',
    icon: 'card_giftcard_outlined',
    bgColor: '#FFFDF0',
    bgColorHex: '0xFFFFFDF0',
    iconColor: '#D97706',
    iconColorHex: '0xFFD97706',
  },
  {
    id: 'HEALTH_MEDICINE',
    apiCode: 'HEALTH_MEDICINE',
    title: 'Health & Medicine',
    subtitle: 'Medicines, supplements, medical supplies, etc.',
    icon: 'medication_outlined',
    bgColor: '#ECFDF5',
    bgColorHex: '0xFFECFDF5',
    iconColor: '#059669',
    iconColorHex: '0xFF059669',
  },
  {
    id: 'HOUSEHOLD_ITEMS',
    apiCode: 'HOUSEHOLD_ITEMS',
    title: 'Household Items',
    subtitle: 'Kitchenware, home decor, daily use items, etc.',
    icon: 'soup_kitchen_outlined',
    bgColor: '#FFF7ED',
    bgColorHex: '0xFFFFF7ED',
    iconColor: '#EA580C',
    iconColorHex: '0xFFEA580C',
  },
  {
    id: 'COMMERCIAL_GOODS',
    apiCode: 'COMMERCIAL_GOODS',
    title: 'Commercial Goods',
    subtitle: 'Samples, parts, raw materials, products, etc.',
    icon: 'inventory_2_outlined',
    bgColor: '#F0F9FF',
    bgColorHex: '0xFFF0F9FF',
    iconColor: '#0284C7',
    iconColorHex: '0xFF0284C7',
  },
  {
    id: 'OTHER',
    apiCode: 'OTHER',
    title: 'Others',
    subtitle: 'Other items not listed above.',
    icon: 'more_horiz_outlined',
    bgColor: '#F9FAFB',
    bgColorHex: '0xFFF9FAFB',
    iconColor: '#4B5563',
    iconColorHex: '0xFF4B5563',
  },
]);

// 2. Box Types by Weight (Screens 3 & 4)
export const courierBoxTypesByWeight: Record<string, Array<{
  id: string;
  title: string;
  dimensions: string;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  tag: string;
  capacity: string;
}>> = Object.freeze({
  '10 Kg': [
    {
      id: 'box_10kg_small',
      title: 'Small Box',
      dimensions: '30 × 20 × 20 cm',
      lengthCm: 30.0,
      widthCm: 20.0,
      heightCm: 20.0,
      tag: 'Best for Documents, Books, Electronics',
      capacity: 'Up to 10 Kg',
    },
    {
      id: 'box_10kg_medium',
      title: 'Medium Box',
      dimensions: '30 × 30 × 25 cm',
      lengthCm: 30.0,
      widthCm: 30.0,
      heightCm: 25.0,
      tag: 'Best for Clothing, Accessories, Home Items',
      capacity: 'Up to 10 Kg',
    },
    {
      id: 'box_10kg_large',
      title: 'Large Box',
      dimensions: '40 × 30 × 30 cm',
      lengthCm: 40.0,
      widthCm: 30.0,
      heightCm: 30.0,
      tag: 'Best for Shoes, Helmets, Small Appliances',
      capacity: 'Up to 10 Kg',
    },
  ],
  '15 Kg': [
    {
      id: 'box_15kg_medium',
      title: 'Medium Box',
      dimensions: '35 × 28 × 32 cm',
      lengthCm: 35.0,
      widthCm: 28.0,
      heightCm: 32.0,
      tag: 'Best for Clothes, Books, Home Items',
      capacity: 'Up to 15 Kg',
    },
    {
      id: 'box_15kg_large',
      title: 'Large Box',
      dimensions: '40 × 30 × 35 cm',
      lengthCm: 40.0,
      widthCm: 30.0,
      heightCm: 35.0,
      tag: 'Best for Appliances, Toys, Accessories',
      capacity: 'Up to 15 Kg',
    },
    {
      id: 'box_15kg_xlarge',
      title: 'Extra Large Box',
      dimensions: '45 × 32 × 40 cm',
      lengthCm: 45.0,
      widthCm: 32.0,
      heightCm: 40.0,
      tag: 'Best for Kitchen Items, Medium Appliances',
      capacity: 'Up to 15 Kg',
    },
  ],
  '25 Kg': [
    {
      id: 'box_25kg_medium',
      title: 'Medium Box',
      dimensions: '45 × 35 × 40 cm',
      lengthCm: 45.0,
      widthCm: 35.0,
      heightCm: 40.0,
      tag: 'Best for Clothing, Shoes, Books, Home Items',
      capacity: 'Up to 25 Kg',
    },
    {
      id: 'box_25kg_large',
      title: 'Large Box',
      dimensions: '50 × 40 × 45 cm',
      lengthCm: 50.0,
      widthCm: 40.0,
      heightCm: 45.0,
      tag: 'Best for Appliances, Toys, Accessories, Helmet',
      capacity: 'Up to 25 Kg',
    },
    {
      id: 'box_25kg_xlarge',
      title: 'Extra Large Box',
      dimensions: '60 × 45 × 50 cm',
      lengthCm: 60.0,
      widthCm: 45.0,
      heightCm: 50.0,
      tag: 'Best for Large Appliances, Bulk Items, Luggage',
      capacity: 'Up to 25 Kg',
    },
  ],
});

export const getBoxesForWeight = (weight: string) => {
  return courierBoxTypesByWeight[weight] || [];
};

// 3. Parcel Dimensions & Cards
export const courierParcelDimensions = Object.freeze({
  Small: { length: 30, width: 20, height: 10 },
  Medium: { length: 45, width: 35, height: 30 },
  Large: { length: 60, width: 45, height: 45 },
});

export const courierParcelTypes = Object.freeze([
  {
    id: 'SMALL',
    title: 'Small',
    weight: 'Up to 2 kg',
    dimensions: '30 × 20 × 10',
    lengthCm: 30,
    widthCm: 20,
    heightCm: 10,
    isCustom: false,
  },
  {
    id: 'MEDIUM',
    title: 'Medium',
    weight: '2 - 10 kg',
    dimensions: '45 × 35 × 30',
    lengthCm: 45,
    widthCm: 35,
    heightCm: 30,
    isCustom: false,
  },
  {
    id: 'LARGE',
    title: 'Large',
    weight: '10 - 25 kg',
    dimensions: '60 × 45 × 45',
    lengthCm: 60,
    widthCm: 45,
    heightCm: 45,
    isCustom: false,
  },
  {
    id: 'CUSTOM',
    title: 'Custom',
    weight: 'Enter size',
    dimensions: 'Define',
    isCustom: true,
  },
]);

// 4. Service Type Options (Local Delivery & Intercity Delivery)
export const courierLocalOptions = Object.freeze([
  {
    id: 'BIKE_PRIORITY',
    title: 'Bike Priority Delivery',
    badge: 'FASTEST',
    badgeColor: '#EF4444',
    badgeColorHex: '0xFFEF4444',
    badgeTextColor: '#FFFFFF',
    badgeTextColorHex: '0xFFFFFFFF',
    description: 'Lightning fast delivery by bike for urgent and time-sensitive shipments.',
    tags: [
      { icon: 'bolt', label: 'Fastest' },
      { icon: 'location_on_outlined', label: 'Real-time Tracking' },
      { icon: 'verified_user_outlined', label: 'High Priority' },
    ],
    deliveryTime: 'Delivery in 1 – 3 hours',
    price: '₹120',
    basePrice: 120.0,
    icon: 'two_wheeler',
  },
  {
    id: 'SAME_DAY',
    title: 'Same Day Delivery',
    badge: 'TODAY',
    badgeColor: '#FEE2E2',
    badgeColorHex: '0xFFFEE2E2',
    badgeTextColor: '#EF4444',
    badgeTextColorHex: '0xFFEF4444',
    description: 'Delivered on the same day within city limits.',
    tags: [
      { icon: 'calendar_today_outlined', label: 'Same Day' },
      { icon: 'verified_user_outlined', label: 'Reliable' },
      { icon: 'home_outlined', label: 'Doorstep Delivery' },
    ],
    deliveryTime: 'Delivery by 8 PM today',
    price: '₹150',
    basePrice: 150.0,
    icon: 'local_shipping_outlined',
  },
  {
    id: 'HYBRID_DRONE',
    title: 'Hybrid Drone Delivery',
    badge: null,
    badgeColor: null,
    badgeColorHex: null,
    badgeTextColor: null,
    badgeTextColorHex: null,
    description: 'Next-gen delivery using drone & road hybrid network.',
    tags: [
      { icon: 'eco_outlined', label: 'Eco-friendly' },
      { icon: 'rocket_launch_outlined', label: 'Innovative' },
      { icon: 'verified_user_outlined', label: 'Secure' },
    ],
    deliveryTime: 'Delivery in 30 – 90 mins (if eligible)',
    price: '₹200',
    basePrice: 200.0,
    icon: 'flight_takeoff',
  },
  {
    id: 'NEXT_DAY_LOCAL',
    title: 'Next Day Delivery',
    badge: null,
    badgeColor: null,
    badgeColorHex: null,
    badgeTextColor: null,
    badgeTextColorHex: null,
    description: 'Cost-effective delivery for non-urgent shipments.',
    tags: [
      { icon: 'calendar_today_outlined', label: 'Next Day' },
      { icon: 'savings_outlined', label: 'Affordable' },
      { icon: 'verified_user_outlined', label: 'Reliable' },
    ],
    deliveryTime: 'Delivery by end of next day',
    price: '₹100',
    basePrice: 100.0,
    icon: 'local_shipping_sharp',
  },
]);

export const courierIntercityOptions = Object.freeze([
  {
    id: 'STANDARD_DELIVERY',
    title: 'Standard Delivery',
    badge: 'MOST POPULAR',
    badgeColor: '#EF4444',
    badgeColorHex: '0xFFEF4444',
    badgeTextColor: '#FFFFFF',
    badgeTextColorHex: '0xFFFFFFFF',
    description: 'Reliable delivery within 2 – 3 business days for non-urgent shipments.',
    tags: [
      { icon: 'verified_user_outlined', label: 'Reliable' },
      { icon: 'savings_outlined', label: 'Affordable' },
      { icon: 'home_outlined', label: 'Doorstep Delivery' },
    ],
    deliveryTime: 'Delivery in 2 – 3 business days',
    price: '₹100',
    basePrice: 100.0,
    icon: 'local_shipping',
  },
  {
    id: 'EXPRESS_DELIVERY',
    title: 'Express Delivery',
    badge: 'FAST',
    badgeColor: '#FEE2E2',
    badgeColorHex: '0xFFFEE2E2',
    badgeTextColor: '#EF4444',
    badgeTextColorHex: '0xFFEF4444',
    description: 'Priority delivery within city or across major routes with faster transit.',
    tags: [
      { icon: 'bolt', label: 'Fast Delivery' },
      { icon: 'verified_user_outlined', label: 'High Priority' },
      { icon: 'home_outlined', label: 'Doorstep Delivery' },
    ],
    deliveryTime: 'Delivery in 24 – 48 hours',
    price: '₹180',
    basePrice: 180.0,
    icon: 'flash_on',
  },
  {
    id: 'PRECISE_TIME',
    title: 'Precise Time Delivery',
    badge: 'ON TIME, EVERY TIME',
    badgeColor: '#FEE2E2',
    badgeColorHex: '0xFFFEE2E2',
    badgeTextColor: '#EF4444',
    badgeTextColorHex: '0xFFEF4444',
    description: 'Guaranteed delivery at your chosen exact time slot.',
    tags: [
      { icon: 'access_time', label: 'Time Guarantee' },
      { icon: 'calendar_today_outlined', label: 'Time Slot Choice' },
      { icon: 'verified_user_outlined', label: 'Priority Handling' },
    ],
    deliveryTime: 'Delivery at your selected time',
    price: '₹250',
    basePrice: 250.0,
    icon: 'edit_calendar_outlined',
  },
  {
    id: 'SCHEDULE_DELIVERY',
    title: 'Schedule Delivery',
    badge: null,
    badgeColor: null,
    badgeColorHex: null,
    badgeTextColor: null,
    badgeTextColorHex: null,
    description: 'Choose your preferred date and time for pickup and delivery.',
    tags: [
      { icon: 'calendar_today_outlined', label: 'Pick a Date' },
      { icon: 'access_time', label: 'Pick a Time' },
      { icon: 'notifications_none', label: 'Advance Booking' },
    ],
    deliveryTime: 'Deliver on your selected date & time',
    price: '₹130',
    basePrice: 130.0,
    icon: 'calendar_month',
  },
  {
    id: 'NEXT_DAY_INTERCITY',
    title: 'Next Day Delivery',
    badge: 'NEXT BUSINESS DAY',
    badgeColor: '#FEE2E2',
    badgeColorHex: '0xFFFEE2E2',
    badgeTextColor: '#EF4444',
    badgeTextColorHex: '0xFFEF4444',
    description: 'Cost-effective delivery with guaranteed next business day transit.',
    tags: [
      { icon: 'calendar_today_outlined', label: 'Next Business Day' },
      { icon: 'savings_outlined', label: 'Affordable' },
      { icon: 'verified_user_outlined', label: 'Reliable' },
    ],
    deliveryTime: 'Delivery by next business day',
    price: '₹120',
    basePrice: 120.0,
    icon: 'local_shipping_sharp',
  },
]);

// 5. Drop Options (Self Pickup & Self Drop)
export const courierDropOptions = Object.freeze([
  {
    index: 0,
    id: 'SELF_PICKUP',
    title: 'Self Pickup',
    badge: 'Save Time',
    price: '₹50',
    basePrice: 50.0,
    desc: 'You drop the parcel at our nearest Delivez location.',
    description: 'You drop the parcel at our nearest Delivez location.',
    tags: ['Quick Drop', 'Lower Cost'],
    icon: 'directions_run_outlined',
  },
  {
    index: 1,
    id: 'SELF_DROP',
    title: 'Self Drop',
    badge: 'Save Time',
    price: '₹40',
    basePrice: 40.0,
    desc: 'You drop the parcel at our destination hub.',
    description: 'You drop the parcel at our destination hub.',
    tags: ['Flexible', 'Lower Cost'],
    icon: 'storefront_outlined',
  },
]);

// 6. Insurance Options
export const courierInsuranceOptions = Object.freeze([
  {
    index: 0,
    id: 'INSURE_SHIPMENT',
    apiCode: 'INSURE_SHIPMENT',
    title: 'Insure Shipment',
    subtitle: 'Get full protection for your shipment.\\nRecommended for valuable items.',
    description: 'Get full protection for your shipment.\\nRecommended for valuable items.',
    icon: 'shield_outlined',
    isRecommended: true,
    ratePercent: 0.75,
  },
  {
    index: 1,
    id: 'BASIC_COVERAGE',
    apiCode: 'BASIC_COVERAGE',
    title: 'Basic Coverage',
    subtitle: 'Limited coverage as per carrier terms.\\nCoverage up to ₹10,000',
    description: 'Limited coverage as per carrier terms.\\nCoverage up to ₹10,000',
    icon: 'gpp_maybe_outlined',
    coverageLimit: 10000,
    isRecommended: false,
    ratePercent: 0,
  },
  {
    index: 2,
    id: 'NO_INSURANCE',
    apiCode: 'NO_INSURANCE',
    title: 'No Insurance',
    subtitle: 'I understand the risk of loss or damage\\nand do not want insurance.',
    description: 'I understand the risk of loss or damage\\nand do not want insurance.',
    icon: 'gpp_bad_outlined',
    coverageLimit: 0,
    isRecommended: false,
    ratePercent: 0,
  },
]);

export const getCourierDeliveryConfig = () => ({
  categories: courierPackageCategories,
  packageCategories: courierPackageCategories,
  package_categories: courierPackageCategories,
  boxTypes: courierBoxTypesByWeight,
  box_types: courierBoxTypesByWeight,
  parcelDimensions: courierParcelDimensions,
  parcel_dimensions: courierParcelDimensions,
  parcelTypes: courierParcelTypes,
  parcel_types: courierParcelTypes,
  localOptions: courierLocalOptions,
  local_options: courierLocalOptions,
  intercityOptions: courierIntercityOptions,
  intercity_options: courierIntercityOptions,
  serviceTypes: {
    local: courierLocalOptions,
    intercity: courierIntercityOptions,
  },
  deliveryServices: {
    local: courierLocalOptions,
    intercity: courierIntercityOptions,
  },
  delivery_services: {
    local: courierLocalOptions,
    intercity: courierIntercityOptions,
  },
  dropOptions: courierDropOptions,
  drop_options: courierDropOptions,
  selfServiceOptions: courierDropOptions,
  self_service_options: courierDropOptions,
  insuranceOptions: courierInsuranceOptions,
  insurance_options: courierInsuranceOptions,
});
`;

let content = fs.readFileSync(targetPath, 'utf8');

// Replace or append definitions
if (!content.includes('courierPackageCategories')) {
  content = content.replace(
    'export const getCourierOptions = () => ({',
    `${newDefinitions}\n\nexport const getCourierOptions = () => ({`
  );
}

// Update getCourierOptions to include the new fields
const updatedFields = `  // Flutter Mobile App Comprehensive Specifications
  categories: courierPackageCategories,
  packageCategories: courierPackageCategories,
  package_categories: courierPackageCategories,
  boxTypes: courierBoxTypesByWeight,
  box_types: courierBoxTypesByWeight,
  parcelDimensions: courierParcelDimensions,
  parcel_dimensions: courierParcelDimensions,
  parcelTypes: courierParcelTypes,
  parcel_types: courierParcelTypes,
  localOptions: courierLocalOptions,
  local_options: courierLocalOptions,
  intercityOptions: courierIntercityOptions,
  intercity_options: courierIntercityOptions,
  deliveryServices: {
    local: courierLocalOptions,
    intercity: courierIntercityOptions,
  },
  delivery_services: {
    local: courierLocalOptions,
    intercity: courierIntercityOptions,
  },
  dropOptions: courierDropOptions,
  drop_options: courierDropOptions,
  selfServiceOptions: courierDropOptions,
  self_service_options: courierDropOptions,
  insuranceOptions: courierInsuranceOptions,
  insurance_options: courierInsuranceOptions,`;

if (!content.includes('package_categories: courierPackageCategories')) {
  content = content.replace(
    'limits: {',
    `${updatedFields}\n  limits: {`
  );
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully updated backend courier-config.ts');

// Also save copy to scratch/backend/
if (!fs.existsSync(path.dirname(scratchCopyPath))) {
  fs.mkdirSync(path.dirname(scratchCopyPath), { recursive: true });
}
fs.writeFileSync(scratchCopyPath, content, 'utf8');
console.log('Successfully synced copy to scratch/backend/courier-config.ts');

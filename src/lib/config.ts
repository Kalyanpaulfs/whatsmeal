export const RESTAURANT_CONFIG = {
  name: 'Bella Vista',
  phone: '+91 72772 63880',
  whatsappNumber: '917277263880',
  address: '123 Food Street, Downtown, Mumbai 400001',
  location: {
    latitude: 19.0760,
    longitude: 72.8777,
    address: '123 Food Street, Downtown, Mumbai 400001',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    postalCode: '400001',
  },
  deliveryRadius: 3, // 3km radius
  operatingHours: {
    monday: { open: '07:00', close: '23:00', isClosed: false },
    tuesday: { open: '07:00', close: '23:00', isClosed: false },
    wednesday: { open: '07:00', close: '23:00', isClosed: false },
    thursday: { open: '07:00', close: '23:00', isClosed: false },
    friday: { open: '07:00', close: '23:00', isClosed: false },
    saturday: { open: '07:00', close: '23:00', isClosed: false },
    sunday: { open: '07:00', close: '23:00', isClosed: false },
  },
  deliveryFee: 49,
  minimumOrderAmount: 299,
  estimatedDeliveryTime: 30, // 30 minutes
};

export const APP_CONFIG = {
  name: 'Bella Vista Food Ordering',
  version: '1.0.0',
  description: 'Premium food ordering experience',
  supportEmail: 'support@bellavista.com',
  supportPhone: '+91 72772 63880',
};

export const DELIVERY_CONFIG = {
  freeDeliveryThreshold: 499,
  deliveryFee: 49,
  maxDeliveryRadius: 3, // km
  estimatedDeliveryTime: 30, // minutes
  preparationTime: 15, // minutes
};

export const TAX_CONFIG = {
  gstRate: 0.18, // 18% GST
  serviceCharge: 0.05, // 5% service charge
};

export const TIME_SLOTS = [
  { id: 'slot_1', time: '12:00 PM', isAvailable: true },
  { id: 'slot_2', time: '12:30 PM', isAvailable: true },
  { id: 'slot_3', time: '1:00 PM', isAvailable: true },
  { id: 'slot_4', time: '1:30 PM', isAvailable: true },
  { id: 'slot_5', time: '2:00 PM', isAvailable: true },
  { id: 'slot_6', time: '2:30 PM', isAvailable: true },
  { id: 'slot_7', time: '3:00 PM', isAvailable: true },
  { id: 'slot_8', time: '3:30 PM', isAvailable: true },
  { id: 'slot_9', time: '4:00 PM', isAvailable: true },
  { id: 'slot_10', time: '4:30 PM', isAvailable: true },
  { id: 'slot_11', time: '5:00 PM', isAvailable: true },
  { id: 'slot_12', time: '5:30 PM', isAvailable: true },
  { id: 'slot_13', time: '6:00 PM', isAvailable: true },
  { id: 'slot_14', time: '6:30 PM', isAvailable: true },
  { id: 'slot_15', time: '7:00 PM', isAvailable: true },
  { id: 'slot_16', time: '7:30 PM', isAvailable: true },
  { id: 'slot_17', time: '8:00 PM', isAvailable: true },
  { id: 'slot_18', time: '8:30 PM', isAvailable: true },
  { id: 'slot_19', time: '9:00 PM', isAvailable: true },
  { id: 'slot_20', time: '9:30 PM', isAvailable: true },
  { id: 'slot_21', time: '10:00 PM', isAvailable: true },
  { id: 'slot_22', time: '10:30 PM', isAvailable: true },
  { id: 'slot_23', time: '11:00 PM', isAvailable: true },
  { id: 'slot_24', time: '11:30 PM', isAvailable: true },
];

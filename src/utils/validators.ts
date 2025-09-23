export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email.trim()) {
    errors.push('Email is required');
  } else if (!emailRegex.test(email)) {
    errors.push('Please enter a valid email address');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePhoneNumber = (phone: string): ValidationResult => {
  const errors: string[] = [];
  const cleaned = phone.replace(/\D/g, '');
  
  if (!phone.trim()) {
    errors.push('Phone number is required');
  } else if (cleaned.length !== 10) {
    errors.push('Phone number must be 10 digits');
  } else if (!/^[6-9]\d{9}$/.test(cleaned)) {
    errors.push('Please enter a valid Indian phone number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateName = (name: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!name.trim()) {
    errors.push('Name is required');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  } else if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
    errors.push('Name can only contain letters and spaces');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateAddress = (address: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!address.trim()) {
    errors.push('Address is required');
  } else if (address.trim().length < 10) {
    errors.push('Address must be at least 10 characters long');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateOrderDetails = (details: {
  customerName: string;
  phoneNumber: string;
  type: 'dine-in' | 'pickup' | 'delivery';
  deliveryAddress?: string;
}): ValidationResult => {
  const errors: string[] = [];
  
  // Validate name
  const nameValidation = validateName(details.customerName);
  if (!nameValidation.isValid) {
    errors.push(...nameValidation.errors);
  }
  
  // Validate phone
  const phoneValidation = validatePhoneNumber(details.phoneNumber);
  if (!phoneValidation.isValid) {
    errors.push(...phoneValidation.errors);
  }
  
  // Validate delivery address if required
  if (details.type === 'delivery' && !details.deliveryAddress) {
    errors.push('Delivery address is required for delivery orders');
  } else if (details.type === 'delivery' && details.deliveryAddress) {
    const addressValidation = validateAddress(details.deliveryAddress);
    if (!addressValidation.isValid) {
      errors.push(...addressValidation.errors);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateQuantity = (quantity: number): ValidationResult => {
  const errors: string[] = [];
  
  if (quantity < 0) {
    errors.push('Quantity cannot be negative');
  } else if (quantity > 99) {
    errors.push('Maximum quantity per item is 99');
  } else if (!Number.isInteger(quantity)) {
    errors.push('Quantity must be a whole number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

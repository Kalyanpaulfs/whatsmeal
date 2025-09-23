export interface Customer {
  id: string; // Firebase auto-generated ID
  name: string;
  phoneNumber: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  isVIP: boolean;
  isBlocked: boolean;
  createdAt: string; // First order date
  lastOrderAt: string; // Last order date
  updatedAt: string;
}

export interface CustomerFilters {
  searchTerm?: string; // Name or phone number
  isVIP?: boolean;
  isBlocked?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  vipCustomers: number;
  blockedCustomers: number;
  newCustomersThisWeek: number;
  newCustomersThisMonth: number;
  topCustomersBySpent: Customer[];
  topCustomersByOrders: Customer[];
  averageOrderValue: number;
  totalRevenue: number;
}

export interface CustomerInsights {
  topCustomersBySpent: Customer[];
  topCustomersByOrders: Customer[];
  newCustomersThisWeek: Customer[];
  newCustomersThisMonth: Customer[];
}

export interface CustomerUpdateData {
  isVIP?: boolean;
  isBlocked?: boolean;
  address?: string;
}

export interface CustomerStats {
  totalCustomers: number;
  vipCustomers: number;
  blockedCustomers: number;
  newCustomersThisWeek: number;
  newCustomersThisMonth: number;
  totalRevenue: number;
  averageOrderValue: number;
}

// Shared data models for ScanServe.
//
// MULTI-TENANT NOTE: this v1 serves ONE restaurant. To support many restaurants
// later, add `restaurantId: string` to MenuItem, Order, and Voucher, scope every
// repository query by it, and encode QR codes as `?restaurant=X&table=N` instead
// of just `?table=N`. The repository interface in lib/repository.ts is already
// shaped so that change stays localized to the data layer.

export interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number; // BDT
  available: boolean;
  imageUrl?: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export type OrderStatus = "pending" | "paid" | "preparing" | "ready" | "completed";

export interface Order {
  id: string;
  tableNumber: string;
  items: OrderItem[];
  subtotal: number;
  voucherCode?: string;
  discountAmount: number;
  total: number;
  status: OrderStatus;
  createdAt: string; // ISO timestamp
  transactionId?: string;
}

export type VoucherType = "percent" | "fixed";

export interface Voucher {
  code: string;
  type: VoucherType;
  value: number;
  active: boolean;
}

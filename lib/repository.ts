// Repository interface layer.
//
// The UI and API routes only ever talk to these interfaces, never to `fs` or a
// specific JSON file directly. That means swapping the storage backend later
// (e.g. Supabase/Postgres) is a matter of writing a new class that implements
// these interfaces and changing the single export in lib/data/index.ts — no
// changes needed in app/ or components/.

import { MenuItem, Order, OrderStatus, Voucher } from "./types";

export interface MenuRepository {
  list(): Promise<MenuItem[]>;
  get(id: string): Promise<MenuItem | null>;
  create(item: Omit<MenuItem, "id">): Promise<MenuItem>;
  update(id: string, patch: Partial<Omit<MenuItem, "id">>): Promise<MenuItem | null>;
  remove(id: string): Promise<boolean>;
}

export interface OrderRepository {
  list(): Promise<Order[]>;
  get(id: string): Promise<Order | null>;
  create(order: Omit<Order, "id" | "createdAt">): Promise<Order>;
  updateStatus(id: string, status: OrderStatus, transactionId?: string): Promise<Order | null>;
}

export interface VoucherRepository {
  list(): Promise<Voucher[]>;
  getByCode(code: string): Promise<Voucher | null>;
  create(voucher: Voucher): Promise<Voucher>;
}

export interface DataRepository {
  menu: MenuRepository;
  orders: OrderRepository;
  vouchers: VoucherRepository;
}

// JSON-file implementation of the repository interfaces (lib/repository.ts).
//
// Storage: plain JSON files in /data, read and written with Node's `fs`.
// This is a v1 shortcut so the app runs with zero external accounts. Each
// file's reads/writes are serialized through a tiny per-file queue so two
// concurrent API requests can't corrupt a file with interleaved writes.
//
// TO SWAP FOR SUPABASE/POSTGRES LATER: write a new class implementing
// DataRepository (e.g. lib/data/supabaseRepository.ts) and change the export
// in lib/data/index.ts. Nothing in app/ or components/ needs to change.

import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import {
  DataRepository,
  MenuRepository,
  OrderRepository,
  VoucherRepository,
} from "../repository";
import { MenuItem, Order, OrderStatus, Voucher } from "../types";

const DATA_DIR = path.join(process.cwd(), "data");

// Serializes read-modify-write cycles per file so concurrent requests don't
// stomp on each other (Node is single-threaded, but await points between the
// read and the write leave a window for interleaving without this).
const writeQueues = new Map<string, Promise<unknown>>();

function enqueue<T>(file: string, task: () => Promise<T>): Promise<T> {
  const prior = writeQueues.get(file) ?? Promise.resolve();
  const next = prior.then(task, task);
  writeQueues.set(
    file,
    next.catch(() => undefined)
  );
  return next;
}

async function readJson<T>(fileName: string): Promise<T> {
  const filePath = path.join(DATA_DIR, fileName);
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

async function writeJson<T>(fileName: string, data: T): Promise<void> {
  const filePath = path.join(DATA_DIR, fileName);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

class JsonMenuRepository implements MenuRepository {
  private file = "menu.json";

  list(): Promise<MenuItem[]> {
    return readJson<MenuItem[]>(this.file);
  }

  async get(id: string): Promise<MenuItem | null> {
    const items = await this.list();
    return items.find((item) => item.id === id) ?? null;
  }

  create(item: Omit<MenuItem, "id">): Promise<MenuItem> {
    return enqueue(this.file, async () => {
      const items = await readJson<MenuItem[]>(this.file);
      const newItem: MenuItem = { ...item, id: uuidv4() };
      items.push(newItem);
      await writeJson(this.file, items);
      return newItem;
    });
  }

  update(id: string, patch: Partial<Omit<MenuItem, "id">>): Promise<MenuItem | null> {
    return enqueue(this.file, async () => {
      const items = await readJson<MenuItem[]>(this.file);
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return null;
      items[index] = { ...items[index], ...patch };
      await writeJson(this.file, items);
      return items[index];
    });
  }

  remove(id: string): Promise<boolean> {
    return enqueue(this.file, async () => {
      const items = await readJson<MenuItem[]>(this.file);
      const filtered = items.filter((item) => item.id !== id);
      if (filtered.length === items.length) return false;
      await writeJson(this.file, filtered);
      return true;
    });
  }
}

class JsonOrderRepository implements OrderRepository {
  private file = "orders.json";

  async list(): Promise<Order[]> {
    const orders = await readJson<Order[]>(this.file);
    return [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async get(id: string): Promise<Order | null> {
    const orders = await readJson<Order[]>(this.file);
    return orders.find((order) => order.id === id) ?? null;
  }

  create(order: Omit<Order, "id" | "createdAt">): Promise<Order> {
    return enqueue(this.file, async () => {
      const orders = await readJson<Order[]>(this.file);
      const newOrder: Order = {
        ...order,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };
      orders.push(newOrder);
      await writeJson(this.file, orders);
      return newOrder;
    });
  }

  updateStatus(id: string, status: OrderStatus, transactionId?: string): Promise<Order | null> {
    return enqueue(this.file, async () => {
      const orders = await readJson<Order[]>(this.file);
      const index = orders.findIndex((order) => order.id === id);
      if (index === -1) return null;
      orders[index] = {
        ...orders[index],
        status,
        ...(transactionId ? { transactionId } : {}),
      };
      await writeJson(this.file, orders);
      return orders[index];
    });
  }
}

class JsonVoucherRepository implements VoucherRepository {
  private file = "vouchers.json";

  list(): Promise<Voucher[]> {
    return readJson<Voucher[]>(this.file);
  }

  async getByCode(code: string): Promise<Voucher | null> {
    const vouchers = await this.list();
    return (
      vouchers.find((v) => v.code.toLowerCase() === code.toLowerCase()) ?? null
    );
  }

  create(voucher: Voucher): Promise<Voucher> {
    return enqueue(this.file, async () => {
      const vouchers = await readJson<Voucher[]>(this.file);
      vouchers.push(voucher);
      await writeJson(this.file, vouchers);
      return voucher;
    });
  }
}

export const jsonRepository: DataRepository = {
  menu: new JsonMenuRepository(),
  orders: new JsonOrderRepository(),
  vouchers: new JsonVoucherRepository(),
};

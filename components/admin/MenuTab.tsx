"use client";

import { useEffect, useState } from "react";
import { MenuItem } from "@/lib/types";

type FormState = {
  id?: string;
  name: string;
  category: string;
  description: string;
  price: string;
  available: boolean;
  imageUrl: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  category: "",
  description: "",
  price: "",
  available: true,
  imageUrl: "",
};

export default function MenuTab() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/menu");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openAdd() {
    setForm(EMPTY_FORM);
    setError(null);
  }

  function openEdit(item: MenuItem) {
    setForm({
      id: item.id,
      name: item.name,
      category: item.category,
      description: item.description,
      price: String(item.price),
      available: item.available,
      imageUrl: item.imageUrl || "",
    });
    setError(null);
  }

  async function save() {
    if (!form) return;
    const price = Number(form.price);
    if (!form.name.trim() || Number.isNaN(price)) {
      setError("Name and a valid price are required");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      name: form.name,
      category: form.category || "Uncategorized",
      description: form.description,
      price,
      available: form.available,
      imageUrl: form.imageUrl || undefined,
    };
    const res = await fetch(form.id ? `/api/menu/${form.id}` : "/api/menu", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Could not save item");
      return;
    }
    setForm(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this menu item?")) return;
    await fetch(`/api/menu/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-800">Menu items</h2>
        <button
          onClick={openAdd}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
        >
          + Add item
        </button>
      </div>

      {loading ? (
        <p className="text-stone-400">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Available</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-3 py-2 font-medium text-stone-900">{item.name}</td>
                  <td className="px-3 py-2 text-stone-600">{item.category}</td>
                  <td className="px-3 py-2 text-stone-600">&#2547;{item.price}</td>
                  <td className="px-3 py-2">
                    {item.available ? (
                      <span className="text-green-600">Yes</span>
                    ) : (
                      <span className="text-stone-400">No</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => openEdit(item)}
                      className="mr-3 text-brand-700 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(item.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-stone-400">
                    No menu items yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {form && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-lg">
            <h3 className="mb-3 font-semibold text-stone-900">
              {form.id ? "Edit item" : "Add item"}
            </h3>
            <div className="flex flex-col gap-3">
              <input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
              <input
                placeholder="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
                rows={2}
              />
              <input
                placeholder="Price (BDT)"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
              <input
                placeholder="Image URL (optional)"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
              <label className="flex items-center gap-2 text-sm text-stone-700">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => setForm({ ...form, available: e.target.checked })}
                />
                Available
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="mt-2 flex justify-end gap-2">
                <button
                  onClick={() => setForm(null)}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { notFound } from "next/navigation";
import { db } from "@/lib/data";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pending: "Awaiting payment",
  paid: "Sent to the kitchen",
  preparing: "Being prepared",
  ready: "Ready to serve",
  completed: "Completed",
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: { orderId: string };
}) {
  const order = await db.orders.get(params.orderId);
  if (!order) notFound();

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
          &#10003;
        </div>
        <h1 className="text-xl font-bold text-stone-900">
          Your order has been sent to the kitchen
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Table {order.tableNumber} &middot; Order #{order.id.slice(0, 8).toUpperCase()}
        </p>
        <p className="mt-3 inline-block rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
          {STATUS_LABEL[order.status] || order.status}
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold text-stone-800">Order summary</h2>
        <div className="flex flex-col gap-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-stone-700">
                {item.quantity} &times; {item.name}
              </span>
              <span className="text-stone-900">&#2547;{item.price * item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 border-t border-stone-100 pt-3 text-sm">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span>
            <span>&#2547;{order.subtotal}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Discount {order.voucherCode ? `(${order.voucherCode})` : ""}</span>
              <span>-&#2547;{order.discountAmount}</span>
            </div>
          )}
          <div className="mt-1 flex justify-between text-base font-bold text-stone-900">
            <span>Total paid</span>
            <span>&#2547;{order.total}</span>
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-stone-400">
        Keep this page open to track your order status.
      </p>
    </main>
  );
}

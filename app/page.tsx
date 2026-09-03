import { db } from "@/lib/data";
import MenuBrowser from "@/components/customer/MenuBrowser";

export const dynamic = "force-dynamic";

export default async function CustomerMenuPage({
  searchParams,
}: {
  searchParams: { table?: string };
}) {
  const items = await db.menu.list();
  const tableNumber = searchParams.table || "";

  return (
    <main className="mx-auto max-w-2xl pb-24">
      <header className="sticky top-0 z-10 bg-brand-600 px-4 py-5 text-white shadow-sm">
        <h1 className="text-xl font-bold tracking-tight">ScanServe Restaurant</h1>
        {tableNumber ? (
          <p className="mt-0.5 text-sm text-brand-50">Table {tableNumber}</p>
        ) : (
          <p className="mt-0.5 text-sm text-brand-50">
            No table detected — scan the QR code on your table
          </p>
        )}
      </header>

      <MenuBrowser items={items} tableNumber={tableNumber} />
    </main>
  );
}

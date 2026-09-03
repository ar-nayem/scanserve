import { redirect } from "next/navigation";
import { isAdminRequest } from "@/lib/apiAuth";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  if (!isAdminRequest()) {
    redirect("/admin/login");
  }

  return <AdminDashboard />;
}

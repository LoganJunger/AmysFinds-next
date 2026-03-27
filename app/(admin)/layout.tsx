import { requireAdmin } from "@/lib/auth/helpers";
import AdminSidebar from "./AdminSidebar";
import ToastContainer from "@/app/components/Toast";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-surface-secondary">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
      <ToastContainer />
    </div>
  );
}

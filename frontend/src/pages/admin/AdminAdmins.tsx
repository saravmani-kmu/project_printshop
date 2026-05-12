import { useEffect, useState } from "react";
import { Loader2, UserCheck, UserX, ShieldCheck, ShieldAlert, Clock } from "lucide-react";
import api from "../../api/client";
import toast from "react-hot-toast";
import { clsx } from "clsx";

type AdminEntry = {
  id: string;
  user_name: string;
  user_email: string;
  role: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export default function AdminAdmins() {
  const [admins, setAdmins] = useState<AdminEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const load = () =>
    api.get("/admin/users/admins")
      .then((r) => setAdmins(r.data))
      .catch(() => toast.error("Failed to load admin list"))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    setActing(id);
    try {
      await api.patch(`/admin/users/admins/${id}/approve`);
      toast.success("Admin approved");
      load();
    } catch {
      toast.error("Failed to approve");
    } finally {
      setActing(null);
    }
  };

  const reject = async (id: string) => {
    setActing(id);
    try {
      await api.patch(`/admin/users/admins/${id}/reject`);
      toast.success("Request rejected");
      load();
    } catch {
      toast.error("Failed to reject");
    } finally {
      setActing(null);
    }
  };

  const pending = admins.filter((a) => a.status === "pending");
  const others = admins.filter((a) => a.status !== "pending");

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Admin Users</h1>
      <p className="text-gray-500 text-sm mb-8">Approve or reject admin access requests.</p>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
        </div>
      ) : (
        <>
          {/* Pending requests */}
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Pending Requests
              {pending.length > 0 && (
                <span className="ml-1 bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-bold">
                  {pending.length}
                </span>
              )}
            </h2>
            <div className="card divide-y divide-gray-100">
              {pending.length === 0 ? (
                <p className="text-sm text-gray-400 p-4">No pending requests.</p>
              ) : pending.map((a) => (
                <div key={a.id} className="flex items-center gap-4 p-4">
                  <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 text-amber-700 font-bold text-sm">
                    {a.user_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{a.user_name}</p>
                    <p className="text-sm text-gray-500">{a.user_email}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(a.created_at).toLocaleDateString("en-IN")}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => approve(a.id)}
                      disabled={acting === a.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      {acting === a.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                      Approve
                    </button>
                    <button
                      onClick={() => reject(a.id)}
                      disabled={acting === a.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:border-red-400 hover:text-red-600 text-gray-600 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      <UserX className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* All admins */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> All Admins
            </h2>
            <div className="card divide-y divide-gray-100">
              {others.length === 0 ? (
                <p className="text-sm text-gray-400 p-4">No other admin records.</p>
              ) : others.map((a) => (
                <div key={a.id} className="flex items-center gap-4 p-4">
                  <div className={clsx(
                    "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm",
                    a.status === "approved" ? "bg-primary-100 text-primary-700" : "bg-red-100 text-red-600"
                  )}>
                    {a.user_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{a.user_name}</p>
                    <p className="text-sm text-gray-500">{a.user_email}</p>
                  </div>
                  <span className={clsx(
                    "text-xs px-2.5 py-1 rounded-full font-medium capitalize",
                    a.role === "super" ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-600"
                  )}>
                    {a.role}
                  </span>
                  <span className={clsx(
                    "text-xs px-2.5 py-1 rounded-full font-medium capitalize flex items-center gap-1",
                    a.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                  )}>
                    {a.status === "approved" ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                    {a.status}
                  </span>
                  {a.status === "approved" && (
                    <button
                      onClick={() => reject(a.id)}
                      disabled={acting === a.id}
                      title="Revoke access"
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {acting === a.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

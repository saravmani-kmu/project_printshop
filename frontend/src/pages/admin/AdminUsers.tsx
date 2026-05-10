import { useEffect, useState } from "react";
import { Loader2, UserCheck, UserX } from "lucide-react";
import api from "../../api/client";
import toast from "react-hot-toast";
import { clsx } from "clsx";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get("/admin/users").then((r) => setUsers(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const toggle = async (id: string) => {
    await api.patch(`/admin/users/${id}/toggle-active`);
    toast.success("Updated");
    load();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Customers</h1>
      <div className="card">
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>
          ) : users.map((u) => (
            <div key={u.id} className="flex items-center gap-4 p-4">
              <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 text-primary-700 font-bold text-sm">
                {u.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{u.name}</p>
                <p className="text-sm text-gray-500">{u.email}</p>
              </div>
              <span className={clsx("text-xs px-2 py-1 rounded-full font-medium capitalize", u.user_type === "b2b" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600")}>
                {u.user_type || "—"}
              </span>
              <span className={clsx("text-xs px-2 py-1 rounded-full font-medium", u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                {u.is_active ? "Active" : "Blocked"}
              </span>
              <button
                onClick={() => toggle(u.id)}
                className={clsx("p-1.5 rounded-lg transition-colors", u.is_active ? "text-gray-400 hover:text-red-500 hover:bg-red-50" : "text-gray-400 hover:text-green-500 hover:bg-green-50")}
              >
                {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

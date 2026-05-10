import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Users, Package, Clock, ArrowRight } from "lucide-react";
import api from "../../api/client";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/orders?status=pending").then((r) => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what needs your attention.</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Pending Orders", value: orders.length, icon: Clock, color: "text-yellow-600 bg-yellow-100" },
          { label: "Total Orders", value: "—", icon: ShoppingBag, color: "text-blue-600 bg-blue-100" },
          { label: "Products", value: "—", icon: Package, color: "text-purple-600 bg-purple-100" },
          { label: "Customers", value: "—", icon: Users, color: "text-green-600 bg-green-100" },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending orders */}
      <div className="card">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Pending Orders</h2>
          <Link to="/admin/orders" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading…</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No pending orders 🎉</div>
          ) : (
            orders.slice(0, 10).map((o) => (
              <Link key={o.id} to={`/admin/orders/${o.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-semibold text-gray-900">{o.order_number}</p>
                  <p className="text-sm text-gray-500">{o.user_name} · {o.item_count} item{o.item_count > 1 ? "s" : ""}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">₹{o.total_amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString("en-IN")}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

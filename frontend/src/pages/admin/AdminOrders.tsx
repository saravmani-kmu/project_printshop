import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ArrowRight } from "lucide-react";
import api from "../../api/client";
import { clsx } from "clsx";

const STATUSES = ["all", "pending", "inprogress", "completed"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = filter !== "all" ? `?status=${filter}` : "";
    api.get(`/admin/orders${q}`).then((r) => setOrders(r.data)).finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Orders</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={clsx(
              "px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-colors",
              filter === s ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {s === "inprogress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No orders found</div>
          ) : (
            orders.map((o) => (
              <Link key={o.id} to={`/admin/orders/${o.id}`} className="flex flex-wrap items-center justify-between p-4 hover:bg-gray-50 transition-colors gap-3">
                <div>
                  <p className="font-bold text-gray-900">{o.order_number}</p>
                  <p className="text-sm text-gray-500">{o.user_name} · {o.user_email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={clsx("badge", o.current_status === "pending" ? "badge-pending" : o.current_status === "inprogress" ? "badge-inprogress" : "badge-completed")}>
                    {o.current_status === "inprogress" ? "In Progress" : o.current_status}
                  </span>
                  <span className={clsx(o.payment_status === "paid" ? "badge-paid" : o.payment_status === "failed" ? "badge-failed" : "badge-pending")}>
                    {o.payment_status}
                  </span>
                  <p className="font-bold text-gray-900">₹{o.total_amount.toFixed(2)}</p>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

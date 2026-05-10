import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ArrowRight, Loader2 } from "lucide-react";
import { getOrders } from "../api/orders";
import type { Order } from "../types";

const statusBadge = (s: string) => {
  if (s === "pending") return "badge-pending";
  if (s === "inprogress") return "badge-inprogress";
  return "badge-completed";
};

const statusLabel = (s: string) => {
  if (s === "inprogress") return "In Progress";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const paymentBadge = (s: string) => s === "paid" ? "badge-paid" : s === "failed" ? "badge-failed" : "badge-pending";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
        <Package className="w-7 h-7 text-primary-600" /> My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-24">
          <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-400">No orders yet</h2>
          <p className="text-gray-400 mt-2 mb-6">Start shopping to see your orders here</p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Link key={o.id} to={`/orders/${o.id}`} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow group">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="font-bold text-gray-900">{o.order_number}</p>
                  <span className={statusBadge(o.current_status)}>{statusLabel(o.current_status)}</span>
                  <span className={paymentBadge(o.payment_status)}>{o.payment_status.charAt(0).toUpperCase() + o.payment_status.slice(1)}</span>
                </div>
                <p className="text-sm text-gray-500">
                  {o.items.length} item{o.items.length > 1 ? "s" : ""} ·{" "}
                  {new Date(o.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                </p>
                {o.items[0] && (
                  <p className="text-sm text-gray-600 mt-1">{o.items[0].product_name}{o.items.length > 1 ? ` + ${o.items.length - 1} more` : ""}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <p className="text-xl font-bold text-primary-700">₹{o.total_amount.toFixed(2)}</p>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

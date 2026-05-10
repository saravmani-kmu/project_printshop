import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import api from "../../api/client";
import toast from "react-hot-toast";
import OrderStatusBar from "../../components/OrderStatusBar";
import { clsx } from "clsx";

const STATUS_OPTIONS = ["pending", "inprogress", "completed"];

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState("");
  const [note, setNote] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  const load = () => api.get(`/admin/orders/${id}`).then((r) => { setOrder(r.data); setNewStatus(r.data.current_status); }).finally(() => setLoading(false));
  useEffect(() => { if (id) load(); }, [id]);

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    setUpdating(true);
    try {
      await api.post(`/admin/orders/${id}/status`, { status: newStatus, note: note || null, is_public: isPublic });
      toast.success("Order status updated");
      setNote("");
      setIsPublic(false);
      load();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentUpdate = async (status: string) => {
    await api.patch(`/admin/orders/${id}/payment?payment_status=${status}`);
    toast.success("Payment status updated");
    load();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>;
  if (!order) return <div className="p-8 text-gray-400">Order not found</div>;

  return (
    <div className="p-8 max-w-5xl">
      <button onClick={() => navigate("/admin/orders")} className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </button>

      <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">{order.order_number}</h1>
          <p className="text-gray-500 mt-1">{order.user.name} · {order.user.email}</p>
        </div>
        <p className="text-3xl font-extrabold text-primary-700">₹{order.total_amount.toFixed(2)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Status bar */}
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 mb-6">Order Progress</h2>
            <OrderStatusBar currentStatus={order.current_status} history={order.status_history} />
          </div>

          {/* Update status */}
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 mb-4">Update Status</h2>
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setNewStatus(s)}
                    className={clsx(
                      "px-4 py-2 rounded-lg font-semibold text-sm capitalize transition-all",
                      newStatus === s ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {s === "inprogress" ? "In Progress" : s}
                  </button>
                ))}
              </div>
              <div>
                <label className="label">Note / Comment</label>
                <textarea
                  className="input resize-none h-20"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note about this status update…"
                />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="public" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="w-4 h-4 text-primary-600 rounded" />
                <label htmlFor="public" className="text-sm text-gray-700 font-medium">
                  Make this note visible to the customer
                </label>
              </div>
              <button className="btn-primary" onClick={handleStatusUpdate} disabled={updating}>
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {updating ? "Updating…" : "Update Status"}
              </button>
            </div>
          </div>

          {/* Items */}
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 mb-4">Items</h2>
            {order.items.map((item: any) => (
              <div key={item.id} className="py-3 border-b border-gray-100 last:border-0 flex justify-between">
                <div>
                  <p className="font-medium text-gray-900">{item.product_name}</p>
                  <p className="text-sm text-gray-500">{item.variant_label}</p>
                </div>
                <p className="font-bold text-gray-900">₹{item.unit_price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Address */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-3">Delivery Address</h3>
            <p className="text-sm text-gray-700 font-semibold">{order.address.full_name}</p>
            <p className="text-sm text-gray-600 mt-1">
              {order.address.line1}<br />
              {order.address.line2 && <>{order.address.line2}<br /></>}
              {order.address.city}, {order.address.state} – {order.address.pincode}
            </p>
            <p className="text-sm text-gray-500 mt-2">📞 +91 {order.address.mobile}</p>
          </div>

          {/* Payment */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-3">Payment</h3>
            <p className="text-sm text-gray-600 capitalize">{order.payment_method === "cod" ? "Cash on Delivery" : "Invoice / Bank Transfer"}</p>
            <div className="mt-3 mb-4">
              <span className={clsx(order.payment_status === "paid" ? "badge-paid" : order.payment_status === "failed" ? "badge-failed" : "badge-pending")}>
                {order.payment_status}
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handlePaymentUpdate("paid")} className="text-xs btn-outline py-1.5 px-3">Mark Paid</button>
              <button onClick={() => handlePaymentUpdate("pending")} className="text-xs btn-ghost py-1.5 px-3">Mark Pending</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

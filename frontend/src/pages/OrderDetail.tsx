import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, CreditCard, Loader2 } from "lucide-react";
import { getOrder } from "../api/orders";
import type { Order } from "../types";
import OrderStatusBar from "../components/OrderStatusBar";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    getOrder(id).then(setOrder).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>;
  if (!order) return <div className="text-center py-20 text-gray-400">Order not found</div>;

  const paymentLabel = order.payment_method === "cod" ? "Cash on Delivery" : "Invoice / Bank Transfer";

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <button onClick={() => navigate("/orders")} className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">{order.order_number}</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "long" })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-extrabold text-primary-700">₹{order.total_amount.toFixed(2)}</p>
          {order.discount_amount > 0 && (
            <p className="text-sm text-green-600 font-medium">Saved ₹{order.discount_amount.toFixed(2)}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status bar */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 mb-6">Order Status</h2>
            <OrderStatusBar currentStatus={order.current_status} history={order.status_history} />
          </div>

          {/* Items */}
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-600" /> Items Ordered
            </h2>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-4 flex justify-between items-start gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{item.product_name}</p>
                    <p className="text-sm text-gray-500">{item.variant_label}</p>
                    {item.template_id && <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full mt-1 inline-block">Template design</span>}
                    {item.custom_image_path && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full mt-1 inline-block">Custom design</span>}
                  </div>
                  <p className="font-bold text-gray-900 flex-shrink-0">₹{item.unit_price.toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 mt-2 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>–₹{order.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 text-lg pt-1">
                <span>Total</span>
                <span className="text-primary-700">₹{order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary-600" /> Payment
            </h3>
            <p className="text-sm text-gray-600">{paymentLabel}</p>
            <div className="mt-3">
              <span className={
                order.payment_status === "paid" ? "badge-paid" :
                order.payment_status === "failed" ? "badge-failed" : "badge-pending"
              }>
                {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

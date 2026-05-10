import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingCart, ArrowRight, Loader2, Package } from "lucide-react";
import { getCart, removeCartItem } from "../api/cart";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import toast from "react-hot-toast";

export default function Cart() {
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const { items, setItems, removeItem } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    getCart().then((data) => { setItems(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleRemove = async (id: string) => {
    await removeCartItem(id);
    removeItem(id);
    toast.success("Removed from cart");
  };

  const userType = user?.user_type || "retail";
  const total = items.reduce((sum, i) => sum + (userType === "b2b" ? i.b2b_price : i.retail_price), 0);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
        <ShoppingCart className="w-7 h-7 text-primary-600" /> Your Cart
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-400">Your cart is empty</h2>
          <p className="text-gray-400 mt-2 mb-6">Browse our products and add items to get started</p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="card p-5 flex gap-4 items-start">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Package className="w-7 h-7 text-primary-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{item.product_name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{item.variant_label} · {item.quantity} pcs</p>
                  {item.template_id && <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full mt-1 inline-block">Template selected</span>}
                  {item.custom_image_path && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full mt-1 inline-block">Custom design</span>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-lg font-bold text-primary-700">
                    ₹{userType === "b2b" ? item.b2b_price : item.retail_price}
                  </p>
                  <button onClick={() => handleRemove(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div>
            <div className="card p-6 sticky top-24">
              <h2 className="font-bold text-gray-900 text-lg mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                {items.map((i) => (
                  <div key={i.id} className="flex justify-between text-gray-600">
                    <span className="truncate mr-2">{i.product_name}</span>
                    <span className="font-medium flex-shrink-0">₹{userType === "b2b" ? i.b2b_price : i.retail_price}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold text-gray-900 text-lg">
                <span>Subtotal</span>
                <span className="text-primary-700">₹{total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Discounts applied at checkout</p>
              <button
                className="btn-primary w-full justify-center mt-6 text-base py-3"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

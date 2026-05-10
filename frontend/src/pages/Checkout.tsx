import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MapPin, CheckCircle, Loader2, Truck, FileText } from "lucide-react";
import { getAddresses, createAddress } from "../api/addresses";
import { placeOrder } from "../api/orders";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import type { Address } from "../types";
import AddressForm from "../components/AddressForm";
import toast from "react-hot-toast";
import { clsx } from "clsx";

export default function Checkout() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "invoice">("cod");
  const [showAddForm, setShowAddForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [loading, setLoading] = useState(true);

  const { items, clear } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const userType = user?.user_type || "retail";

  useEffect(() => {
    getAddresses().then((data) => {
      setAddresses(data);
      const def = data.find((a) => a.is_default);
      if (def) setSelectedAddress(def.id);
      if (data.length === 0) setShowAddForm(true);
    }).finally(() => setLoading(false));
  }, []);

  const handleAddAddress = async (data: Omit<Address, "id" | "is_default">) => {
    setSavingAddress(true);
    try {
      const addr = await createAddress(data);
      setAddresses((prev) => [...prev, addr]);
      setSelectedAddress(addr.id);
      setShowAddForm(false);
      toast.success("Address saved!");
    } catch {
      toast.error("Failed to save address");
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.error("Please select a delivery address"); return; }
    setPlacing(true);
    try {
      const order = await placeOrder({ address_id: selectedAddress, payment_method: paymentMethod });
      clear();
      toast.success("Order placed successfully!");
      navigate(`/orders/${order.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  const subtotal = items.reduce((sum, i) => sum + (userType === "b2b" ? i.b2b_price : i.retail_price), 0);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-600" /> Delivery Address
              </h2>
              {!showAddForm && (
                <button onClick={() => setShowAddForm(true)} className="btn-ghost text-sm py-1.5 px-3">
                  <Plus className="w-4 h-4" /> Add New
                </button>
              )}
            </div>

            {showAddForm ? (
              <AddressForm
                onSubmit={handleAddAddress}
                onCancel={addresses.length > 0 ? () => setShowAddForm(false) : undefined}
                loading={savingAddress}
              />
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <button
                    key={addr.id}
                    onClick={() => setSelectedAddress(addr.id)}
                    className={clsx(
                      "w-full p-4 rounded-xl border-2 text-left transition-all",
                      selectedAddress === addr.id ? "border-primary-600 bg-primary-50" : "border-gray-200 hover:border-primary-300"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{addr.full_name}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
                          {addr.city}, {addr.district}, {addr.state} – {addr.pincode}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">📞 +91 {addr.mobile}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {selectedAddress === addr.id && <CheckCircle className="w-5 h-5 text-primary-600" />}
                        {addr.is_default && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Default</span>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 mb-4">Payment Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setPaymentMethod("cod")}
                className={clsx(
                  "p-4 rounded-xl border-2 text-left transition-all",
                  paymentMethod === "cod" ? "border-primary-600 bg-primary-50" : "border-gray-200 hover:border-primary-300"
                )}
              >
                <Truck className="w-6 h-6 text-primary-600 mb-2" />
                <p className="font-semibold text-gray-900">Cash on Delivery</p>
                <p className="text-sm text-gray-500 mt-1">Pay when you receive your order</p>
              </button>
              <button
                onClick={() => setPaymentMethod("invoice")}
                className={clsx(
                  "p-4 rounded-xl border-2 text-left transition-all",
                  paymentMethod === "invoice" ? "border-primary-600 bg-primary-50" : "border-gray-200 hover:border-primary-300"
                )}
              >
                <FileText className="w-6 h-6 text-primary-600 mb-2" />
                <p className="font-semibold text-gray-900">Invoice / Bank Transfer</p>
                <p className="text-sm text-gray-500 mt-1">We'll send you a GST invoice</p>
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
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
            <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-xs">
                <span>Discount (if applicable)</span>
                <span>Calculated at order</span>
              </div>
            </div>
            <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-bold text-gray-900 text-lg">
              <span>Total</span>
              <span className="text-primary-700">₹{subtotal.toFixed(2)}+</span>
            </div>
            <button
              className="btn-primary w-full justify-center mt-6 text-base py-3"
              onClick={handlePlaceOrder}
              disabled={placing || !selectedAddress}
            >
              {placing ? <><Loader2 className="w-4 h-4 animate-spin" /> Placing…</> : "Place Order"}
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">
              By placing this order, you agree to our terms and conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

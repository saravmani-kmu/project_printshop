import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, User, ArrowRight } from "lucide-react";
import { setUserType } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { clsx } from "clsx";

export default function UserTypeSelect() {
  const [selected, setSelected] = useState<"retail" | "b2b" | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await setUserType(selected);
      if (user) setUser({ ...user, user_type: selected });
      toast.success(`Welcome! You're registered as a ${selected === "b2b" ? "B2B" : "Retail"} customer.`);
      navigate("/products");
    } catch {
      toast.error("Failed to set user type. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="card p-8 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-gray-900">Welcome, {user?.name}!</h1>
            <p className="text-gray-500 mt-2">Please select how you'd like to shop with us. This cannot be changed later.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setSelected("retail")}
              className={clsx(
                "p-6 rounded-xl border-2 text-left transition-all",
                selected === "retail"
                  ? "border-primary-600 bg-primary-50 shadow-md"
                  : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
              )}
            >
              <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center mb-4", selected === "retail" ? "bg-primary-600" : "bg-gray-100")}>
                <User className={clsx("w-6 h-6", selected === "retail" ? "text-white" : "text-gray-500")} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Retail Customer</h3>
              <p className="text-gray-500 text-sm mt-2">Personal use, small quantities, standard pricing.</p>
              <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
                <li>✓ Access to all products</li>
                <li>✓ Seasonal discount offers</li>
                <li>✓ Easy reordering</li>
              </ul>
            </button>

            <button
              onClick={() => setSelected("b2b")}
              className={clsx(
                "p-6 rounded-xl border-2 text-left transition-all",
                selected === "b2b"
                  ? "border-primary-600 bg-primary-50 shadow-md"
                  : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
              )}
            >
              <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center mb-4", selected === "b2b" ? "bg-primary-600" : "bg-gray-100")}>
                <Building2 className={clsx("w-6 h-6", selected === "b2b" ? "text-white" : "text-gray-500")} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">B2B Customer</h3>
              <p className="text-gray-500 text-sm mt-2">Businesses, bulk orders, special pricing.</p>
              <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
                <li>✓ Up to 30% lower prices</li>
                <li>✓ Priority processing</li>
                <li>✓ Invoice & credit options</li>
              </ul>
            </button>
          </div>

          <button
            className="btn-primary w-full justify-center text-base py-3"
            disabled={!selected || loading}
            onClick={handleContinue}
          >
            {loading ? "Saving..." : "Continue to PrintShop"} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

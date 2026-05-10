import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Loader2 } from "lucide-react";
import api from "../../api/client";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function AdminRegister() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card p-8 max-w-md w-full text-center">
          <Shield className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Admin Registration</h1>
          <p className="text-gray-500 mb-6">You must be signed in to register as admin.</p>
          <Link to="/login" className="btn-primary">Sign In with Google</Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Registration Submitted!</h1>
          <p className="text-gray-500">
            Your admin request has been sent for approval. You'll gain access once an administrator approves your request via email.
          </p>
          <button onClick={() => navigate("/")} className="btn-outline mt-6">Go to Home</button>
        </div>
      </div>
    );
  }

  const handleRegister = async () => {
    setLoading(true);
    try {
      await api.post("/admin/register");
      setSubmitted(true);
      toast.success("Registration submitted successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="card p-8 max-w-md w-full shadow-lg">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-9 h-9 text-primary-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Admin Registration</h1>
          <p className="text-gray-500 mt-2">Request admin access to manage the PrintShop platform</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600">Registering as:</p>
          <div className="flex items-center gap-3 mt-2">
            {user.picture && <img src={user.picture} alt={user.name} className="w-9 h-9 rounded-full" />}
            <div>
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
          <strong>Note:</strong> Your request will be sent to the configured admin email for approval.
          You will not have access until approved. Approval links expire in 1 hour.
        </div>

        <button
          className="btn-primary w-full justify-center text-base py-3"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : "Submit Registration Request"}
        </button>
      </div>
    </div>
  );
}

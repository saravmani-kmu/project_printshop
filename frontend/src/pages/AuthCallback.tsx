import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getMe } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const isNew = params.get("new_user") === "true";
    getMe()
      .then((user) => {
        setUser(user);
        if (isNew || !user.user_type) {
          navigate("/select-type", { replace: true });
        } else {
          navigate("/products", { replace: true });
        }
      })
      .catch(() => navigate("/login", { replace: true }));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Signing you in…</p>
      </div>
    </div>
  );
}

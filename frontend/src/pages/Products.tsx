import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2, CreditCard, BookOpen, Gift, FileText, Tag, Calendar, Search } from "lucide-react";
import { getProducts } from "../api/products";
import { useAuthStore } from "../store/authStore";
import type { Product } from "../types";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "credit-card": CreditCard,
  "book-open": BookOpen,
  "gift": Gift,
  "file-text": FileText,
  "tag": Tag,
  "calendar": Calendar,
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { user } = useAuthStore();

  useEffect(() => {
    getProducts().then(setProducts).finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const userType = user?.user_type || "retail";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Our Products</h1>
          <p className="text-gray-500 mt-1">
            {user ? (
              <span>Showing <strong className="text-primary-600">{userType.toUpperCase()}</strong> pricing</span>
            ) : (
              "Sign in to see your special pricing"
            )}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((p) => {
          const Icon = ICONS[p.icon || ""] || CreditCard;
          const prices = p.variants.filter((v) => v.is_active).map((v) => userType === "b2b" ? v.b2b_price : v.retail_price);
          const minPrice = prices.length ? Math.min(...prices) : null;

          return (
            <Link
              key={p.id}
              to={`/products/${p.id}`}
              className="card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group flex flex-col"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 transition-colors">
                  <Icon className="w-7 h-7 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">{p.name}</h3>
                  {minPrice && (
                    <p className="text-primary-600 font-semibold text-sm mt-0.5">Starting ₹{minPrice}</p>
                  )}
                </div>
              </div>
              {p.description && (
                <p className="text-gray-500 text-sm flex-1">{p.description}</p>
              )}

              {p.variants.filter((v) => v.is_active).length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.variants.filter((v) => v.is_active).slice(0, 3).map((v) => (
                    <span key={v.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                      {v.label} – ₹{userType === "b2b" ? v.b2b_price : v.retail_price}
                    </span>
                  ))}
                  {p.variants.length > 3 && (
                    <span className="text-xs text-primary-600 px-2 py-1 font-medium">+{p.variants.length - 3} more</span>
                  )}
                </div>
              )}

              <div className="mt-4 flex items-center text-primary-600 font-semibold text-sm group-hover:gap-2 transition-all">
                Select & Order <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">No products found</p>
        </div>
      )}
    </div>
  );
}

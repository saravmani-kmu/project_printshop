import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, LogOut, LayoutDashboard, Printer, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { logout } from "../api/auth";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, setUser } = useAuthStore();
  const items = useCartStore((s) => s.items);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate("/");
    toast.success("Logged out successfully");
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center group-hover:bg-primary-700 transition-colors">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Print<span className="text-primary-600">Shop</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              Products
            </Link>
            {user && (
              <Link to="/orders" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                My Orders
              </Link>
            )}
            {user?.is_admin && (
              <Link to="/admin" className="text-gray-600 hover:text-primary-600 font-medium transition-colors flex items-center gap-1">
                <LayoutDashboard className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                  {items.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {items.length}
                    </span>
                  )}
                </Link>
                <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                  )}
                  <div className="hidden lg:block">
                    <p className="text-sm font-semibold text-gray-900 leading-none">{user.name}</p>
                    <p className="text-xs text-gray-400 capitalize mt-0.5">{user.user_type || "customer"}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-2 px-4">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          <Link to="/products" className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setMobileOpen(false)}>Products</Link>
          {user && <Link to="/orders" className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setMobileOpen(false)}>My Orders</Link>}
          {user && <Link to="/cart" className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setMobileOpen(false)}>Cart ({items.length})</Link>}
          {user?.is_admin && <Link to="/admin" className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setMobileOpen(false)}>Admin Dashboard</Link>}
          {user ? (
            <button onClick={handleLogout} className="block w-full text-left py-2 px-3 text-red-600 hover:bg-red-50 rounded-lg font-medium">Logout</button>
          ) : (
            <Link to="/login" className="block py-2 px-3 text-primary-600 hover:bg-primary-50 rounded-lg font-medium" onClick={() => setMobileOpen(false)}>Sign In</Link>
          )}
        </div>
      )}
    </nav>
  );
}

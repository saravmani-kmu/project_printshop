import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import api from "../../api/client";
import toast from "react-hot-toast";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", icon: "", sort_order: 0 });
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/admin/products").then((r) => setProducts(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/products", form);
      toast.success("Product created");
      setShowForm(false);
      setForm({ name: "", description: "", icon: "", sort_order: 0 });
      load();
    } catch {
      toast.error("Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/admin/products/${id}`);
    toast.success("Product deleted");
    load();
  };

  const toggleActive = async (p: any) => {
    await api.put(`/admin/products/${p.id}`, { is_active: !p.is_active });
    load();
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Products</h1>
        <button className="btn-primary text-sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">New Product</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Name *</label>
              <input className="input" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Icon key</label>
              <input className="input" value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="e.g. credit-card" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <input className="input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <label className="label">Sort Order</label>
              <input className="input" type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: +e.target.value }))} />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary text-sm" disabled={saving}>{saving ? "Saving…" : "Create Product"}</button>
              <button type="button" className="btn-ghost text-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="divide-y divide-gray-100">
          {products.map((p) => (
            <div key={p.id}>
              <div
                className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setExpanded(expanded === p.id ? null : p.id)}
              >
                {expanded === p.id ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.variants?.length || 0} variants</p>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => toggleActive(p)} className={`text-xs px-2 py-1 rounded-full font-medium ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {p.is_active ? "Active" : "Inactive"}
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {expanded === p.id && (
                <div className="px-6 pb-4 pt-2 bg-gray-50/50">
                  <p className="text-sm text-gray-500 mb-3">{p.description}</p>
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Variants</h4>
                  {p.variants?.map((v: any) => (
                    <div key={v.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                      <span className="text-gray-700 font-medium">{v.label}</span>
                      <span className="text-gray-500">Retail: ₹{v.retail_price} · B2B: ₹{v.b2b_price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

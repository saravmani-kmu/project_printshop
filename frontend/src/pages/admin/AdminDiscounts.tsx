import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, Tag } from "lucide-react";
import api from "../../api/client";
import toast from "react-hot-toast";

const blank = { name: "", type: "percentage", value: 10, applies_to: "both", trigger_type: "always", trigger_config: {}, is_active: true };

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({ ...blank });
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/admin/discounts").then((r) => setDiscounts(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/discounts", form);
      toast.success("Discount created");
      setShowForm(false);
      setForm({ ...blank });
      load();
    } catch { toast.error("Failed to create discount"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this discount?")) return;
    await api.delete(`/admin/discounts/${id}`);
    toast.success("Deleted");
    load();
  };

  const toggleActive = async (d: any) => {
    await api.put(`/admin/discounts/${d.id}`, { ...d, is_active: !d.is_active });
    load();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Discounts & Offers</h1>
        <button className="btn-primary text-sm" onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4" /> New Discount</button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">New Discount Rule</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Name *</label>
              <input className="input" required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Festive 15% off" />
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={(e) => set("type", e.target.value)}>
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="label">Value ({form.type === "percentage" ? "%" : "₹"})</label>
              <input className="input" type="number" min="0" required value={form.value} onChange={(e) => set("value", +e.target.value)} />
            </div>
            <div>
              <label className="label">Applies To</label>
              <select className="input" value={form.applies_to} onChange={(e) => set("applies_to", e.target.value)}>
                <option value="both">All Customers</option>
                <option value="retail">Retail Only</option>
                <option value="b2b">B2B Only</option>
              </select>
            </div>
            <div>
              <label className="label">Trigger</label>
              <select className="input" value={form.trigger_type} onChange={(e) => set("trigger_type", e.target.value)}>
                <option value="always">Always Active</option>
                <option value="time_of_day">Time of Day</option>
                <option value="season">Seasonal (by month)</option>
                <option value="loyalty">Loyalty (months since join)</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary text-sm" disabled={saving}>{saving ? "Saving…" : "Create"}</button>
              <button type="button" className="btn-ghost text-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="divide-y divide-gray-100">
          {loading ? <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div> :
            discounts.map((d) => (
              <div key={d.id} className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Tag className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{d.name}</p>
                  <p className="text-sm text-gray-500">
                    {d.type === "percentage" ? `${d.value}% off` : `₹${d.value} off`} · {d.applies_to} · {d.trigger_type}
                  </p>
                </div>
                <button onClick={() => toggleActive(d)} className={`text-xs px-2 py-1 rounded-full font-medium ${d.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {d.is_active ? "Active" : "Inactive"}
                </button>
                <button onClick={() => handleDelete(d.id)} className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

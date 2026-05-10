import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import api from "../../api/client";
import toast from "react-hot-toast";

export default function AdminConfig() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});

  useEffect(() => {
    api.get("/admin/config").then((r) => {
      setConfigs(r.data);
      const init: Record<string, string> = {};
      r.data.forEach((c: any) => { init[c.key] = c.value; });
      setEdits(init);
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (key: string) => {
    setSaving(key);
    try {
      await api.put(`/admin/config/${key}`, { value: edits[key] });
      toast.success(`${key} updated`);
    } catch { toast.error("Failed to update"); }
    finally { setSaving(null); }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">App Settings</h1>
      <p className="text-gray-500 mb-6">Configure system-wide settings</p>

      {loading ? (
        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>
      ) : (
        <div className="card divide-y divide-gray-100">
          {configs.map((c) => (
            <div key={c.key} className="p-5">
              <label className="label font-mono text-primary-700">{c.key}</label>
              {c.description && <p className="text-xs text-gray-400 mb-2">{c.description}</p>}
              <div className="flex gap-3">
                <input
                  className="input"
                  value={edits[c.key] || ""}
                  onChange={(e) => setEdits((prev) => ({ ...prev, [c.key]: e.target.value }))}
                />
                <button
                  className="btn-primary text-sm flex-shrink-0"
                  onClick={() => handleSave(c.key)}
                  disabled={saving === c.key}
                >
                  {saving === c.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

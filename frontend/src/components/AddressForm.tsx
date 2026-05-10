import { useState } from "react";
import type { Address } from "../types";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan",
  "Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli","Daman and Diu",
  "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

type AddressFormData = Omit<Address, "id" | "is_default">;

interface Props {
  initial?: Partial<AddressFormData>;
  onSubmit: (data: AddressFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export default function AddressForm({ initial, onSubmit, onCancel, loading }: Props) {
  const [form, setForm] = useState<AddressFormData>({
    full_name: initial?.full_name || "",
    mobile: initial?.mobile || "",
    line1: initial?.line1 || "",
    line2: initial?.line2 || "",
    city: initial?.city || "",
    district: initial?.district || "",
    state: initial?.state || "Tamil Nadu",
    pincode: initial?.pincode || "",
  });

  const set = (k: keyof AddressFormData, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Full Name *</label>
          <input className="input" required value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Recipient's full name" />
        </div>
        <div>
          <label className="label">Mobile Number *</label>
          <div className="flex">
            <span className="flex items-center px-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-500 text-sm">+91</span>
            <input className="input rounded-l-none" required value={form.mobile} onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile" maxLength={10} />
          </div>
        </div>
      </div>

      <div>
        <label className="label">Address Line 1 *</label>
        <input className="input" required value={form.line1} onChange={(e) => set("line1", e.target.value)} placeholder="House/Flat no., Street name" />
      </div>
      <div>
        <label className="label">Address Line 2</label>
        <input className="input" value={form.line2 || ""} onChange={(e) => set("line2", e.target.value)} placeholder="Landmark, Area (optional)" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="label">City *</label>
          <input className="input" required value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="City" />
        </div>
        <div>
          <label className="label">District *</label>
          <input className="input" required value={form.district} onChange={(e) => set("district", e.target.value)} placeholder="District" />
        </div>
        <div>
          <label className="label">Pincode *</label>
          <input className="input" required value={form.pincode} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit pincode" maxLength={6} />
        </div>
      </div>

      <div>
        <label className="label">State *</label>
        <select className="input" required value={form.state} onChange={(e) => set("state", e.target.value)}>
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Saving..." : "Save Address"}
        </button>
        {onCancel && (
          <button type="button" className="btn-outline" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  );
}

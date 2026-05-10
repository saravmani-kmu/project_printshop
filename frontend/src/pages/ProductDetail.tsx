import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Upload, CheckCircle, ShoppingCart, ArrowLeft, Loader2, Image } from "lucide-react";
import { getProduct, getTemplates } from "../api/products";
import { addToCart } from "../api/cart";
import { useAuthStore } from "../store/authStore";
import type { Product, Template, ProductVariant } from "../types";
import toast from "react-hot-toast";
import api from "../api/client";
import { clsx } from "clsx";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [adding, setAdding] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const userType = user?.user_type || "retail";

  useEffect(() => {
    if (!id) return;
    Promise.all([getProduct(id), getTemplates(id)]).then(([p, t]) => {
      setProduct(p);
      setTemplates(t);
      const active = p.variants.filter((v) => v.is_active);
      if (active.length) setSelectedVariant(active[0]);
    });
  }, [id]);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setSelectedTemplate(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post<{ path: string }>("/uploads/image", form);
      setUploadedPath(res.data.path);
      setUploadPreview(URL.createObjectURL(file));
      toast.success("Design uploaded successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Upload failed. Check file type and size.");
    } finally {
      setUploading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) { navigate("/login"); return; }
    if (!selectedVariant) { toast.error("Please select a quantity option"); return; }
    if (!selectedTemplate && !uploadedPath) { toast.error("Please select a template or upload your design"); return; }

    setAdding(true);
    try {
      await addToCart({
        product_variant_id: selectedVariant.id,
        template_id: selectedTemplate || undefined,
        custom_image_path: uploadedPath || undefined,
      });
      toast.success("Added to cart!");
      navigate("/cart");
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>;
  }

  const price = selectedVariant ? (userType === "b2b" ? selectedVariant.b2b_price : selectedVariant.retail_price) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <button onClick={() => navigate("/products")} className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Product info + variant selection */}
        <div>
          <div className="card p-6">
            <h1 className="text-2xl font-extrabold text-gray-900">{product.name}</h1>
            {product.description && <p className="text-gray-500 mt-2">{product.description}</p>}

            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 mb-3">Select Quantity</h3>
              <div className="grid grid-cols-2 gap-3">
                {product.variants.filter((v) => v.is_active).map((v) => {
                  const vPrice = userType === "b2b" ? v.b2b_price : v.retail_price;
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={clsx(
                        "p-4 rounded-xl border-2 text-left transition-all",
                        isSelected ? "border-primary-600 bg-primary-50" : "border-gray-200 hover:border-primary-300"
                      )}
                    >
                      <p className="font-semibold text-gray-900">{v.label}</p>
                      <p className="text-primary-600 font-bold text-lg mt-1">₹{vPrice}</p>
                      {userType === "b2b" && v.retail_price > v.b2b_price && (
                        <p className="text-xs text-green-600 mt-0.5">Save ₹{v.retail_price - v.b2b_price}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {price && (
              <div className="mt-6 p-4 bg-primary-50 rounded-xl">
                <p className="text-sm text-gray-600">Selected price</p>
                <p className="text-3xl font-extrabold text-primary-700">₹{price}</p>
                {userType === "b2b" && <p className="text-xs text-green-600 font-medium mt-0.5">B2B pricing applied</p>}
              </div>
            )}
          </div>
        </div>

        {/* Right: Template selection + upload */}
        <div className="space-y-6">
          {/* Templates */}
          {templates.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Choose a Template</h3>
              <div className="grid grid-cols-2 gap-3">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTemplate(t.id); setUploadedPath(null); setUploadPreview(null); }}
                    className={clsx(
                      "rounded-xl border-2 overflow-hidden transition-all relative",
                      selectedTemplate === t.id ? "border-primary-600 shadow-md" : "border-gray-200 hover:border-primary-300"
                    )}
                  >
                    {t.preview_image ? (
                      <img src={t.preview_image} alt={t.name} className="w-full h-28 object-cover bg-gray-100" />
                    ) : (
                      <div className="w-full h-28 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                        <Image className="w-8 h-8 text-primary-400" />
                      </div>
                    )}
                    <div className="p-2 text-xs font-semibold text-center text-gray-700">{t.name}</div>
                    {selectedTemplate === t.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Upload */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-800 mb-2">Or Upload Your Design</h3>
            <p className="text-xs text-gray-400 mb-4">Accepted: JPG, PNG, PDF, SVG · Max 10MB</p>

            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".jpg,.jpeg,.png,.pdf,.svg"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />

            {uploadPreview ? (
              <div className="relative rounded-xl overflow-hidden border-2 border-primary-400">
                <img src={uploadPreview} alt="Preview" className="w-full h-40 object-contain bg-gray-50" />
                <div className="absolute top-2 right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <button
                  onClick={() => { setUploadedPath(null); setUploadPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                  className="absolute bottom-2 right-2 text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full border-2 border-dashed border-gray-300 hover:border-primary-400 rounded-xl p-8 text-center transition-colors group"
              >
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-primary-400 animate-spin mx-auto mb-2" />
                ) : (
                  <Upload className="w-8 h-8 text-gray-300 group-hover:text-primary-400 mx-auto mb-2 transition-colors" />
                )}
                <p className="text-sm text-gray-500 font-medium">{uploading ? "Uploading…" : "Click to upload your design"}</p>
              </button>
            )}
          </div>

          {/* Add to Cart */}
          <button
            className="btn-primary w-full justify-center text-base py-3.5"
            onClick={handleAddToCart}
            disabled={adding || !selectedVariant || (!selectedTemplate && !uploadedPath)}
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
            {adding ? "Adding…" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

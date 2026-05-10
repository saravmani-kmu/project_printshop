export interface User {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  user_type: "retail" | "b2b" | null;
  is_admin: boolean;
  admin_role: "super" | "sub" | null;
}

export interface ProductVariant {
  id: string;
  label: string;
  quantity: number;
  retail_price: number;
  b2b_price: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  variants: ProductVariant[];
}

export interface Template {
  id: string;
  name: string;
  preview_image: string | null;
}

export interface CartItem {
  id: string;
  product_variant_id: string;
  template_id: string | null;
  custom_image_path: string | null;
  product_name: string;
  variant_label: string;
  quantity: number;
  retail_price: number;
  b2b_price: number;
}

export interface Address {
  id: string;
  full_name: string;
  mobile: string;
  line1: string;
  line2: string | null;
  city: string;
  district: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

export type OrderStatus = "pending" | "inprogress" | "completed";
export type PaymentMethod = "cod" | "invoice";
export type PaymentStatus = "pending" | "paid" | "failed";

export interface StatusHistory {
  id: string;
  status: OrderStatus;
  note: string | null;
  is_public: boolean;
  created_at: string;
}

export interface OrderItem {
  id: string;
  product_variant_id: string;
  template_id: string | null;
  custom_image_path: string | null;
  unit_price: number;
  quantity: number;
  product_name: string | null;
  variant_label: string | null;
}

export interface Order {
  id: string;
  order_number: string;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  current_status: OrderStatus;
  created_at: string;
  items: OrderItem[];
  status_history: StatusHistory[];
}

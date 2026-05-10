import api from "./client";
import type { CartItem } from "../types";

export const getCart = () => api.get<CartItem[]>("/cart").then((r) => r.data);
export const addToCart = (data: { product_variant_id: string; template_id?: string; custom_image_path?: string }) =>
  api.post("/cart", data);
export const removeCartItem = (id: string) => api.delete(`/cart/${id}`);
export const clearCart = () => api.delete("/cart");

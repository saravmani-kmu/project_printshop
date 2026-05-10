import api from "./client";
import type { Product, Template } from "../types";

export const getProducts = () => api.get<Product[]>("/products").then((r) => r.data);
export const getProduct = (id: string) => api.get<Product>(`/products/${id}`).then((r) => r.data);
export const getTemplates = (productId: string) => api.get<Template[]>(`/products/${productId}/templates`).then((r) => r.data);

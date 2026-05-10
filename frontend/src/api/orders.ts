import api from "./client";
import type { Order } from "../types";

export const placeOrder = (data: { address_id: string; payment_method: "cod" | "invoice" }) =>
  api.post<Order>("/orders", data).then((r) => r.data);
export const getOrders = () => api.get<Order[]>("/orders").then((r) => r.data);
export const getOrder = (id: string) => api.get<Order>(`/orders/${id}`).then((r) => r.data);

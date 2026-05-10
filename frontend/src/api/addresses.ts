import api from "./client";
import type { Address } from "../types";

export const getAddresses = () => api.get<Address[]>("/addresses").then((r) => r.data);
export const createAddress = (data: Omit<Address, "id" | "is_default">) =>
  api.post<Address>("/addresses", data).then((r) => r.data);
export const updateAddress = (id: string, data: Partial<Address>) =>
  api.put<Address>(`/addresses/${id}`, data).then((r) => r.data);
export const deleteAddress = (id: string) => api.delete(`/addresses/${id}`);
export const setDefaultAddress = (id: string) => api.patch(`/addresses/${id}/default`);

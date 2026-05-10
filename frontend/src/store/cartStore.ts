import { create } from "zustand";
import type { CartItem } from "../types";

interface CartState {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  removeItem: (id: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  clear: () => set({ items: [] }),
}));

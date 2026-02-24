"use client";

import { create } from "zustand";

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
};

type ProductStore = {
  products: Product[];
  filtered: Product[];
  categories: string[];
  selectedCategory: string;
  loading: boolean;
  error: string | null;

  fetchProducts: () => Promise<void>;
  filterByCategory: (category: string) => void;
};

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  filtered: [],
  categories: [],
  selectedCategory: "all",
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true });

    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");

      const data: Product[] = await res.json();
      const cats = ["all", ...new Set(data.map((p) => p.category))];

      set({
        products: data,
        filtered: data,
        categories: cats,
        loading: false,
      });
    } catch {
      set({ error: "Failed to fetch products", loading: false });
    }
  },

  filterByCategory: (category) =>
    set((state) => ({
      selectedCategory: category,
      filtered:
        category === "all"
          ? state.products
          : state.products.filter((p) => p.category === category),
    })),
}));

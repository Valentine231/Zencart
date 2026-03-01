"use client";

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

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
  lastFetch: number;

  fetchProducts: () => Promise<void>;
  filterByCategory: (category: string) => void;
};

// Cache products for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export const useProductStore = create<ProductStore>()((
  set,
  get
) => ({
  products: [],
  filtered: [],
  categories: [],
  selectedCategory: "all",
  loading: false,
  error: null,
  lastFetch: 0,

  fetchProducts: async () => {
    const state = get();
    
    // Return cached data if fresh
    if (state.products.length > 0 && Date.now() - state.lastFetch < CACHE_DURATION) {
      return;
    }

    set({ loading: true });

    try {
      const res = await fetch("/api/products", {
        next: { revalidate: 300 }, // ISR: revalidate every 5 minutes
      });
      if (!res.ok) throw new Error("Failed to fetch products");

      const data: Product[] = await res.json();
      const cats = ["all", ...new Set(data.map((p) => p.category))];

      set({
        products: data,
        filtered: data,
        categories: cats,
        loading: false,
        lastFetch: Date.now(),
      });
    } catch (err) {
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

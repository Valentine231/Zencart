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
  searchQuery: string;
  loading: boolean;
  error: string | null;
  lastFetch: number;

  fetchProducts: () => Promise<void>;
  filterByCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  applyFilters: () => void;
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
  searchQuery: "",
  loading: false,
  error: null,
  lastFetch: 0,

  fetchProducts: async () => {
    const state = get();
    
    if (state.products.length > 0 && Date.now() - state.lastFetch < CACHE_DURATION) {
      return;
    }

    set({ loading: true });

    try {
      const res = await fetch("/api/products", {
        next: { revalidate: 300 },
      });
      if (!res.ok) throw new Error("Failed to fetch products");

      const data: Product[] = await res.json();
      
      // Define preferred categories
      const preferredCategories = ["all", "jean", "cloths", "glass", "accessories"];
      
      // Extract unique categories from data and merge with preferred ones to ensure they appear
      const foundCategories = [...new Set(data.map((p) => p.category))];
      const cats = ["all", ...new Set([...preferredCategories.filter(c => c !== "all"), ...foundCategories])];

      set({
        products: data,
        filtered: data,
        categories: cats,
        loading: false,
        lastFetch: Date.now(),
      });
      
      // Apply initial filters if needed
      get().applyFilters();
    } catch (err) {
      set({ error: "Failed to fetch products", loading: false });
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilters();
  },

  filterByCategory: (category) => {
    set({ selectedCategory: category });
    get().applyFilters();
  },

  applyFilters: () => {
    const { products, selectedCategory, searchQuery } = get();
    
    let filtered = products;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    set({ filtered });
  },
}));

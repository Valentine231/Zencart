"use client";

import Loading from "@/Components/Loading";
import { useProductStore } from "@/Store/productStore";
import { useEffect } from "react";

export default function CategoriesSidebar() {
  const categories = useProductStore((state) => state.categories);
  const selectedCategory = useProductStore((state) => state.selectedCategory);
  const filterByCategory = useProductStore((state) => state.filterByCategory);
  const products = useProductStore((state) => state.products);

  useEffect(() => {
    console.log("=== CategoriesSidebar Debug ===");
    console.log("Categories:", categories);
    console.log("Categories length:", categories.length);
    console.log("Products length:", products.length);
    console.log("Selected category:", selectedCategory);
    console.log("=== End Debug ===");
  }, [categories, products, selectedCategory]);

  if (categories.length === 0) {
    return <Loading />;
  }

  return (
    <aside className="w-full lg:w-64 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:sticky lg:top-24">
      <h3 className="font-bold text-gray-900 tracking-tight mb-4 text-lg">
        Categories
      </h3>

      {/* Mobile: horizontal scroll */}
      <ul className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
        {categories.map((cat: any) => (
          <li key={cat} className="flex-shrink-0 lg:flex-shrink">
            <button
              onClick={() => filterByCategory(cat)}
              className={`whitespace-nowrap lg:w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 capitalize ${
                selectedCategory === cat
                  ? "bg-green-600 text-white shadow-md shadow-green-600/20"
                  : "bg-white border border-gray-100 hover:border-green-200 hover:bg-green-50 text-gray-700 hover:text-green-800"
              }`}
            >
              {cat}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
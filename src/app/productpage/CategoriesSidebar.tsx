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
    <aside className="w-full md:w-64 bg-gray-100 p-4 rounded-lg">
      <h3 className="font-semibold mb-4 text-base sm:text-lg">
        Categories
      </h3>

      {/* Mobile: horizontal scroll */}
      <ul className="flex md:block gap-2 md:space-y-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
        {categories.map((cat: any) => (
          <li key={cat} className="flex-shrink-0 md:flex-shrink">
            <button
              onClick={() => filterByCategory(cat)}
              className={`whitespace-nowrap md:w-full text-left px-3 py-2 rounded-lg text-sm sm:text-base transition-colors duration-200 ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white"
                  : "bg-white hover:bg-gray-200 text-blue-600"
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
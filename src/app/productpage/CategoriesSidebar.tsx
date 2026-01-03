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
    return <Loading />
  }

  return (
    <aside className="w-64 bg-gray-100 p-4 rounded-lg">
      <h3 className="font-semibold mb-4">Categories</h3>

      <ul className="space-y-2">
        {categories.map((cat:any) => (
          <li key={cat}>
            <button
              onClick={() => filterByCategory(cat)}
              className={`w-full text-left text-blue-500 px-3 py-2 rounded ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
            {/* {(console.log(useProductStore.getState()), null)} */}
              
          </li>
        ))}
      </ul>
    </aside>
  );
}

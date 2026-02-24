"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { useProductStore } from "@/Store/productStore";
import { useEffect } from "react";

export default function ProductGrid() {
  const filteredProducts = useProductStore((state) => state.filtered);
  const selectedCategory = useProductStore((state) => state.selectedCategory);
  const products = useProductStore((state) => state.products);

  useEffect(() => {
    console.log("=== ProductGrid Debug ===");
    console.log("All products count:", products.length);
    console.log("Filtered products count:", filteredProducts.length);
    console.log("Selected category:", selectedCategory);
    console.log("Filtered products:", filteredProducts);
    console.log("=== End Debug ===");
  }, [filteredProducts, selectedCategory, products]);

  if (filteredProducts.length === 0) {
    return (
      <p className="text-center mt-10 text-base sm:text-lg px-4">
        No products found in this category.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 flex-1 px-4 sm:px-0">
      {filteredProducts.map((prod) => (
        <Card
          key={prod.id}
          className="w-full rounded-xl hover:shadow-lg transition-shadow duration-300"
        >
          <CardMedia
            component="img"
            image={prod.image}
            alt={prod.title}
            className="object-contain p-4 h-40 sm:h-48"
            sx={{ objectFit: "contain" }}
          />

          <CardContent className="px-4 pb-4">
            <h2 className="text-base sm:text-lg font-semibold mb-2 line-clamp-2">
              {prod.title}
            </h2>

            <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-2">
              {prod.description}
            </p>

            <p className="text-indigo-600 font-bold text-sm sm:text-base">
              ${prod.price.toFixed(2)}
            </p>

            <p className="text-gray-500 text-[11px] sm:text-xs mt-2">
              Category: {prod.category}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
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

  // Debug logs
  useEffect(() => {
    console.log("=== ProductGrid Debug ===");
    console.log("All products count:", products.length);
    console.log("Filtered products count:", filteredProducts.length);
    console.log("Selected category:", selectedCategory);
    console.log("Filtered products:", filteredProducts);
    console.log("=== End Debug ===");
  }, [filteredProducts, selectedCategory, products]);

  if (filteredProducts.length === 0) {
    console.log("No filtered products found");
    return <p className="text-center mt-10 text-lg">No products found in this category.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 flex-1">
      {filteredProducts.map((prod) => (
        <Card key={prod.id} className="max-w-sm hover:shadow-lg transition-shadow">
          <CardMedia
            component="img"
            height="200"
            image={prod.image}
            alt={prod.title}
            className="object-contain p-4 h-48"
            sx={{ objectFit: "contain" }}
          />
          <CardContent>
            <h2 className="text-lg font-semibold mb-2 line-clamp-2">{prod.title}</h2>
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{prod.description}</p>
            <p className="text-indigo-600 font-bold">${prod.price.toFixed(2)}</p>
            <p className="text-gray-500 text-xs mt-2">Category: {prod.category}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
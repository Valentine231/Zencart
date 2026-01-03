"use client";

import { useEffect } from "react";
import { useProductStore } from "@/Store/productStore";
import CategoriesSidebar from "./CategoriesSidebar";
import ProductGrid from "./ProductGrid";
import Loading from "@/Components/Loading";

export default function ProductPage() {
  const loading = useProductStore((state) => state.loading);
  const products = useProductStore((state) => state.products);
  
  useEffect(() => {
    console.log("ProductPage: Checking if products need to be fetched");
    
    // Check if products are already loaded
    if (products.length === 0) {
      console.log("ProductPage: Fetching products...");
      useProductStore.getState().fetchProducts();
    } else {
      console.log("ProductPage: Products already loaded, count:", products.length);
    }
  }, [products.length]);

  useEffect(() => {
    console.log("ProductPage - Products:", products);
    console.log("ProductPage - Loading:", loading);
  }, [products, loading]);

  if (loading && products.length === 0) {
    console.log("ProductPage: Showing loading");
    return <Loading />;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex gap-4">
        <CategoriesSidebar />
        <ProductGrid />
      </div>
    </div>
  );
}
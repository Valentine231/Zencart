"use client";

import { useEffect } from "react";
import { useProductStore } from "@/Store/productStore";
import CategoriesSidebar from "./CategoriesSidebar";
import ProductGrid from "./ProductGrid";
import Loading from "@/Components/Loading";
import SearchBar from "./SearchBar";

export const dynamic = "force-dynamic";

export default function ProductPage() {
  const loading = useProductStore((state) => state.loading);
  const products = useProductStore((state) => state.products);

  useEffect(() => {
    console.log("ProductPage: Checking if products need to be fetched");

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
    return <Loading />;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <SearchBar />
      {/* Mobile: column | Desktop: row */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64">
          <CategoriesSidebar />
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <ProductGrid />
        </div>
      </div>
    </div>
  );
}
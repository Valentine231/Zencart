"use client";

import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import { useProductStore } from "@/Store/productStore";
import { useEffect } from "react";
import Loading from "../../Components/Loading";
import Error from "../../Components/Error";
import { Nav } from "@/Components/Nav";
import Footer from "@/Components/layout/footer";
import CategoriesSidebar from "../productpage/CategoriesSidebar";
import AddButton from "@/Components/Addbutton";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

export default function CartPage() {
  const { products, filtered, selectedCategory, fetchProducts, loading, error } =
    useProductStore();

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [fetchProducts, products.length]);

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <div className="flex-1 flex items-center justify-center bg-gray-50/30">
        <Loading />
      </div>
      <Footer />
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <div className="flex-1 flex items-center justify-center bg-gray-50/30">
        <Error message={error} retry={fetchProducts} />
      </div>
      <Footer />
    </div>
  );
  
  if (products.length === 0) return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <div className="flex-1 flex items-center justify-center bg-gray-50/30">
        <p className="text-center text-lg font-semibold text-green-800 bg-green-50 px-6 py-4 rounded-xl">Products unavailable.</p>
      </div>
      <Footer />
    </div>
  );

  const displayProducts = selectedCategory === "all" ? products : filtered;

  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col font-sans text-gray-900">
      <Nav />
      
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100 pt-8 pb-6 px-4 sm:px-6 lg:px-8 shadow-sm relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-1">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">Shop Collection</h1>
          <p className="text-sm lg:text-base text-green-700 font-medium tracking-wide uppercase">Find everything you need right here</p>
        </div>
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 p-4 sm:p-6 lg:p-8">
        {/* Sidebar - hidden on mobile */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <CategoriesSidebar />
        </div>

        {/* Mobile Categories - visible only on mobile */}
        <div className="lg:hidden">
          <CategoriesSidebar />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 flex-1 w-full m-0 p-0">
          {displayProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.5) }}
              className="h-full"
            >
              <Card className="group flex flex-col h-full rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-green-900/10 transition-all duration-300 overflow-hidden bg-white">
                <div className="relative aspect-square overflow-hidden bg-white p-6 flex items-center justify-center">
                  <CardMedia
                    component="img"
                    image={product.image}
                    alt={product.title}
                    className="object-contain h-full w-full mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                
                <div className="p-4 sm:p-5 flex flex-col flex-grow bg-gray-50/50 group-hover:bg-green-50/30 transition-colors border-t border-gray-50">
                  <h2 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-3 group-hover:text-green-700 transition-colors">
                    {product.title}
                  </h2>
                  <div className="mt-auto flex items-center justify-between mb-4">
                    <p className="font-black text-xl text-gray-900">
                      ${product.price.toFixed(2)}
                    </p>
                    <div className="flex items-center text-yellow-400">
                      <Star size={14} className="fill-current" />
                      <span className="text-xs text-gray-500 font-medium ml-1 bg-white px-1.5 py-0.5 rounded-md border border-gray-100">4.9</span>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <AddButton prod={product} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
          
          {displayProducts.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <p className="text-gray-500 text-lg">No products found in this category.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

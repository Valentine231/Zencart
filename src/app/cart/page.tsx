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

export default function CartPage() {
  const { products, filtered, selectedCategory, fetchProducts, loading, error } =
    useProductStore();

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [fetchProducts, products.length]);

  if (loading) return <Loading />;
  if (error) return <Error message={error} retry={fetchProducts} />;
  if (products.length === 0) return <p className="text-center mt-10 text-lg">Products unavailable.</p>;

  
  const displayProducts = selectedCategory === "all" ? products : filtered;

  return (
    <>
      <Nav />
      <div className="flex flex-col lg:flex-row gap-4 p-3 sm:p-4 min-h-screen bg-gray-50">
        {/* Sidebar - hidden on mobile */}
        <div className="hidden lg:block lg:w-48 ">
          <CategoriesSidebar />
        </div>

        {/* Mobile Categories - visible only on mobile */}
        <div className="lg:hidden mb-4">
          <CategoriesSidebar />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 flex-1 w-full">
          {displayProducts.map((product) => (
            <Card
              key={product.id}
              className="flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200 rounded-lg overflow-hidden bg-white h-full"
            >
              <div className="relative w-full h-40 sm:h-48 md:h-56 lg:h-60 overflow-hidden bg-gray-100">
                <CardMedia
                  component="img"
                  image={product.image}
                  alt={product.title}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-3 sm:p-4 flex flex-col flex-grow">
                <h2 className="text-sm sm:text-base md:text-lg font-semibold mb-2 line-clamp-2">
                  {product.title}
                </h2>
                <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 font-semibold">
                  ${product.price.toFixed(2)}
                </p>
              </div>
              <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                <AddButton prod={product} />
              </div>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}

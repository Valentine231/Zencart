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
      <div className="flex flex-row gap-4 p-4">
        <CategoriesSidebar />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 flex-1">
          {displayProducts.map((product) => (
            <Card key={product.id} className="shadow-lg rounded-lg overflow-hidden">
              <CardMedia
                component="img"
                image={product.image}
                alt={product.title}
                className="object-cover h-60 w-full"
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2">{product.title}</h2>
                <p className="text-gray-700 mb-4">${product.price.toFixed(2)}</p>
                
              </div>
              <AddButton prod={product} />
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}

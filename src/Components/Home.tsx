"use client";

import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Star, TrendingUp, Truck, ShieldCheck } from "lucide-react";

type Product = {
  id: number;
  title: string;
  price: number;
  image: string;
};

export default function Home({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6 text-green-800 bg-green-50/30">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-green-300 mb-4" />
          <h2 className="text-2xl font-semibold">No products available at the moment.</h2>
          <p className="text-green-600 mt-2">Please check back later.</p>
        </div>
      </div>
    );
  }

  const featuredProduct = products[1] || products[0];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-100/50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
            
            {/* Hero Text */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold mb-6 shadow-sm border border-green-200">
                <TrendingUp size={16} />
                <span>New Collection 2026</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.1]">
                Refresh Your <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400">
                  Everyday Style
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-lg leading-relaxed">
                Discover our handpicked selection of premium products designed to elevate your lifestyle. Quality meets modern elegance.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-green-700 transition-all shadow-lg hover:shadow-green-600/30 hover:-translate-y-0.5">
                  Shop Now
                  <ArrowRight size={20} />
                </button>
                <button className="inline-flex items-center justify-center gap-2 bg-white text-green-800 px-8 py-4 rounded-full font-semibold border-2 border-green-100 hover:border-green-300 hover:bg-green-50 transition-all">
                  Browse Categories
                </button>
              </div>
            </motion.div>

            {/* Hero Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:w-1/2 relative w-full max-w-md lg:max-w-none"
            >
              <div className="absolute -inset-4 bg-gradient-to-tr from-green-200 to-green-50 rounded-[2.5rem] rotate-3 opacity-70 blur-xl"></div>
              <Card className="relative overflow-hidden rounded-[2rem] shadow-2xl border-4 border-white">
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-green-700 shadow-sm z-10 flex items-center gap-1">
                  <Star size={16} className="fill-green-500 text-green-500" />
                  Featured
                </div>
                <CardMedia
                  component="img"
                  className="w-full h-[500px] object-cover transition-transform duration-700 hover:scale-105"
                  image={featuredProduct?.image ?? "/placeholder.png"}
                  alt="Featured Product"
                />
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">Trending Now</h2>
              <p className="mt-2 text-green-700 font-medium">Top picks hand-selected for you</p>
            </div>
            <button className="hidden sm:inline-flex items-center gap-2 text-green-600 font-semibold hover:text-green-800 transition-colors">
              View All <ArrowRight size={18} />
            </button>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 8).map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card className="group flex flex-col h-full rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-green-900/10 transition-all duration-300 overflow-hidden bg-white">
                  <div className="relative aspect-square overflow-hidden bg-white p-6 flex items-center justify-center">
                    <CardMedia
                      component="img"
                      className="object-contain h-full w-full mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                      image={product.image}
                      alt={product.title}
                    />
                    <div className="absolute inset-x-0 bottom-[-100%] group-hover:bottom-0 p-4 transition-all duration-300 bg-gradient-to-t from-gray-900/50 to-transparent flex justify-center">
                      <button className="bg-white text-green-700 px-6 py-2.5 rounded-full font-bold text-sm shadow-lg hover:bg-green-50 w-full flex items-center justify-center gap-2 transform active:scale-95 transition-all">
                        <ShoppingBag size={16} /> Add to Cart
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-5 flex flex-col flex-grow bg-gray-50/50 group-hover:bg-green-50/30 transition-colors">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-snug mb-3 group-hover:text-green-700 transition-colors">
                      {product.title}
                    </h3>
                    <div className="mt-auto flex items-center justify-between">
                      <p className="font-black text-xl text-gray-900">${product.price.toFixed(2)}</p>
                      <div className="flex items-center text-yellow-400">
                        <Star size={14} className="fill-current" />
                        <span className="text-xs text-gray-500 font-medium ml-1 bg-white px-1.5 py-0.5 rounded-md border border-gray-100">4.9</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center sm:hidden">
            <button className="inline-flex w-full items-center justify-center gap-2 bg-green-50 text-green-700 px-8 py-3 rounded-xl font-semibold hover:bg-green-100 transition-all">
              View All Products
            </button>
          </div>
        </div>
      </section>
      
      {/* Features Banner */}
      <section className="bg-green-800 text-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-green-700/50">
            <div className="p-4 px-8">
              <div className="bg-green-700/50 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-5 ring-4 ring-green-600/30">
                <ShieldCheck size={28} className="text-green-100" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-green-50">Secure Checkout</h3>
              <p className="text-green-200/80 text-sm leading-relaxed">Your payment information is processed securely with industry-standard encryption.</p>
            </div>
            <div className="p-4 px-8 pt-8 md:pt-4">
              <div className="bg-green-700/50 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-5 ring-4 ring-green-600/30">
                <Truck size={28} className="text-green-100" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-green-50">Fast Shipping</h3>
              <p className="text-green-200/80 text-sm leading-relaxed">Free delivery on all orders over $50. Track your package every step of the way.</p>
            </div>
            <div className="p-4 px-8 pt-8 md:pt-4">
              <div className="bg-green-700/50 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-5 ring-4 ring-green-600/30">
                <TrendingUp size={28} className="text-green-100" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-green-50">Premium Quality</h3>
              <p className="text-green-200/80 text-sm leading-relaxed">We ensure the highest quality standards for all our products with a 30-day guarantee.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
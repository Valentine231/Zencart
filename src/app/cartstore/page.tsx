"use client";

import { useCartStore } from "@/Store/cartStore";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import OrderButton from "./Orderbutton";
import { motion } from "framer-motion";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Nav } from "@/Components/Nav";
import Footer from "@/Components/layout/footer";

export const dynamic = "force-dynamic";

export default function CartPage() {
  const {
    items,
    increaseQty,
    decreaseQty,
    removeFromCart,
  } = useCartStore();
  
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
        <Nav />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center max-w-md w-full text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-300">
              <ShoppingBag size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/" className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition-all shadow-md hover:shadow-green-600/30 w-full">
              Start Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 font-sans flex flex-col">
      <Nav />
      
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100 pt-8 pb-6 px-4 sm:px-6 lg:px-8 shadow-sm relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-1">
          <Link href="/cart" className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-800 mb-4 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Continue Shopping
          </Link>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">Your Cart</h1>
          <p className="text-sm lg:text-base text-gray-500 font-medium">Review your items and proceed to checkout</p>
        </div>
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
        
        {/* Cart Items List */}
        <div className="flex-1 space-y-4 sm:space-y-6">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Card className="flex flex-col sm:flex-row shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden bg-white border border-gray-100">
                {/* Product Image */}
                <div className="relative w-full sm:w-48 h-48 sm:h-auto bg-white p-4 flex-shrink-0 flex items-center justify-center border-b sm:border-b-0 sm:border-r border-gray-50">
                  <CardMedia
                    component="img"
                    image={item.image}
                    alt={item.title}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>

                {/* Product Info */}
                <div className="p-5 sm:p-6 flex flex-col flex-grow justify-between gap-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h2 className="font-semibold text-lg text-gray-900 line-clamp-2 leading-snug hover:text-green-700 transition-colors cursor-pointer">
                        {item.title}
                      </h2>
                      <p className="text-green-700 font-black text-xl mt-2">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  {/* Quantity Controls & Subtotal */}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-1 bg-gray-50 rounded-full p-1 border border-gray-100">
                      <button
                        onClick={() => decreaseQty(item.id)}
                        className="w-8 h-8 flex items-center justify-center bg-white hover:bg-green-50 hover:text-green-700 rounded-full text-gray-600 shadow-sm transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-bold text-gray-900 min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => increaseQty(item.id)}
                        className="w-8 h-8 flex items-center justify-center bg-white hover:bg-green-50 hover:text-green-700 rounded-full text-gray-600 shadow-sm transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500 font-medium">Subtotal</span>
                      <p className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Order Summary Panel */}
        <div className="lg:w-80 xl:w-96 flex-shrink-0">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 lg:sticky lg:top-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Order Summary</h3>
            
            <div className="space-y-4 mb-6 text-sm sm:text-base">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                <span className="font-semibold text-gray-900">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Taxes</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-4 mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-900 text-lg">Total</span>
                <span className="font-black text-2xl text-green-700">${total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500">Including comprehensive buyer protection.</p>
            </div>
            
            <OrderButton />
            
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
              <ShoppingBag size={16} className="text-green-600" />
              <span>Secure, encrypted checkout</span>
            </div>
          </div>
        </div>
        
      </div>
      <Footer />
    </div>
  );
}

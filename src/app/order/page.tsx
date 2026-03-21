"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import Loading from "@/Components/Loading";
import Error from "@/Components/Error";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Package, Truck, Calendar, Trash2, ShieldCheck, ArrowRight } from "lucide-react";
import { Nav } from "@/Components/Nav";
import Footer from "@/Components/layout/footer";
import Link from "next/link";

type Order = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    product: {
      title: string;
      image: string;
      price: number;
    };
  }[];
};

export const dynamic = "force-dynamic";

export default function OrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useUser();
  const searchParams = useSearchParams();
  const targetOrderId = searchParams.get("id");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await axios.get("/api/orders", { withCredentials: true });
        setOrders(res.data);
        
        // Auto-initiate payment if order ID is in URL
        if (targetOrderId && res.data.length > 0) {
          const matchedOrder = res.data.find((o: Order) => o.id === targetOrderId && o.status !== "PAID");
          if (matchedOrder) {
            handlepay(matchedOrder.id, res.data);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [targetOrderId]);

  const handlepay = async (orderId: string, currentOrders?: Order[]) => {
    const ordersList = currentOrders || orders;
    const orderToPay = ordersList.find((o) => o.id === orderId);

    if (!orderToPay) {
      console.warn("Order not found for payment", orderId);
      return;
    }

    try {
      const res = await axios.post(
        "/api/paystack",
        {
          email: user?.primaryEmailAddress?.emailAddress,
          amount: orderToPay.total,
          orderId: orderToPay.id,
        },
        { withCredentials: true }
      );
      if (res.data) {
        // API returns `paymentUrl` (camelCase)
        const url = res.data.paymentUrl || res.data.paymenturl;
        if (url) {
          window.location.href = url;
        } else {
          console.error("No payment URL in response", res.data);
          alert("Unable to start payment, missing URL");
        }
      }
    } catch (err) {
      console.error("Error creating checkout session:", err);
      alert("Failed to initiate payment. Please try again.");
    }
  }

  const handleDelete = async (orderId: string) => {
    if (!confirm("Are you sure you want to remove this order from your history?")) return;
    
    try {
      await axios.delete(`/api/orders/${orderId}`, { withCredentials: true });
      setOrders(orders.filter(o => o.id !== orderId));
    } catch (err) {
      console.error("Error deleting order:", err);
      alert("Failed to remove order. Please try again.");
    }
  }

  if (loading) return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-50/30">
      <Nav />
      <div className="flex-1 flex items-center justify-center">
        <Loading />
      </div>
      <Footer />
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-50/30">
      <Nav />
      <div className="flex-1 flex items-center justify-center">
        <Error message={error} />
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen font-sans flex flex-col bg-gray-50/30 text-gray-900">
      <Nav />
      
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100 pt-8 pb-6 px-4 sm:px-6 lg:px-8 shadow-sm relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">Your Orders</h1>
            <p className="text-sm lg:text-base text-gray-500 font-medium">Manage and track your recent purchases</p>
          </div>
          <Link href="/cart" className="inline-flex items-center gap-2 text-green-600 font-semibold hover:text-green-800 transition-colors">
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-6">
        {orders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-300">
              <Package size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders found</h2>
            <p className="text-gray-500 mb-8 max-w-md">You haven't placed any orders yet. Let's find something great for you!</p>
            <Link href="/" className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition-all shadow-md hover:shadow-green-600/30">
              Start Shopping
            </Link>
          </div>
        ) : (
          orders.map((order, idx) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <Card className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                
                {/* Order Header */}
                <div className="bg-gray-50/50 p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 shrink-0">
                      <Package className="text-green-600" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                        <span className="font-medium">Order #{order.id.slice(-8).toUpperCase()}</span>
                      </p>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-lg text-gray-900">${order.total.toFixed(2)}</p>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          order.status === "PAID" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {order.status !== "PAID" && (
                    <button
                      className="bg-green-600 px-6 py-2.5 rounded-full text-white text-sm hover:bg-green-700 font-bold transition shadow-sm hover:shadow-green-600/30 whitespace-nowrap"
                      onClick={() => handlepay(order.id)}
                    >
                      Complete Payment
                    </button>
                  )}
                </div>

                {/* Delivery Status */}
                {order.status === "PAID" && (
                  <div className="px-4 sm:px-6 pt-6">
                    <div className="p-4 bg-green-50/50 rounded-xl border border-green-100 flex items-start gap-4">
                      {(() => {
                        if (!order.createdAt) return null;
                        const createdAt = new Date(order.createdAt);
                        const deliveryDate = new Date(createdAt.getTime() + 5 * 24 * 60 * 60 * 1000);
                        const now = new Date();
                        const diffTime = deliveryDate.getTime() - now.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays <= 0) {
                          return (
                            <>
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                <ShieldCheck className="text-green-600" size={20} />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 mb-0.5">Delivered</p>
                                <p className="text-sm text-green-700 font-medium">Your package arrived on {deliveryDate.toLocaleDateString()}</p>
                              </div>
                            </>
                          );
                        } else {
                          return (
                            <>
                              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                                <Truck className="text-blue-600 animate-pulse" size={20} />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 mb-0.5">On the way</p>
                                <p className="text-sm text-blue-700 font-medium flex items-center gap-1.5">
                                  <Calendar size={14} /> Expected by {deliveryDate.toLocaleDateString()}
                                </p>
                              </div>
                            </>
                          );
                        }
                      })()}
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="p-4 sm:p-6">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Items in Order</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                        <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center p-2 shrink-0 border border-gray-100">
                          <CardMedia
                            component="img"
                            image={item.product.image}
                            alt={item.product.title}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate text-sm mb-1" title={item.product.title}>
                            {item.product.title}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-100">
                              Qty: {item.quantity}
                            </span>
                            <span className="font-bold text-gray-900 text-sm">
                              ${item.product.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex justify-end">
                    <button
                      className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors font-medium border border-transparent hover:border-red-100"
                      onClick={() => handleDelete(order.id)}
                    >
                      <Trash2 size={16} /> Remove History
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
      
      <Footer />
    </div>
  );
}

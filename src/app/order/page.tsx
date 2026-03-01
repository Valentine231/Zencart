"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import Loading from "@/Components/Loading";
import Error from "@/Components/Error";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import { useUser } from "@clerk/nextjs";

type Order = {
  id: string;
  total: number;
  status: string;
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
  const { user }= useUser()

  useEffect(() => {
    async function fetchOrders() {

      try {
        const res = await axios.get("/api/orders", { withCredentials: true });
        setOrders(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const handlepay = async (orderId: string) => {
    // find the order in state so we know the amount
    const orderToPay = orders.find((o) => o.id === orderId);
    if (!orderToPay) {
      console.warn("Order not found for payment", orderId);
      return;
    }

    try {
      const res = await axios.post(
        "/api/monnifycheckout",
        {
          email: user?.primaryEmailAddress?.emailAddress,
          amount: orderToPay.total,
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

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Orders</h1>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            className="border rounded-lg p-6 mb-6 space-y-4 bg-white shadow-lg"
          >
            {/* order header with optional thumbnail */}
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2">
                <strong>Order ID:</strong> {order.id}
                {order.items[0] && (
                  <Image
                    src={order.items[0].product.image}
                    alt="order thumbnail"
                    width={40}
                    height={40}
                    className="rounded"
                  />
                )}
              </p>

              <p className="text-lg font-semibold">
                ${order.total.toFixed(2)}
              </p>
            </div>

            <p>
              <strong>Status:</strong>{" "}
              <span
                className={
                  order.status === "PAID"
                    ? "text-green-600"
                    : "text-yellow-600"
                }
              >
                {order.status}
              </span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4"
                >
                  <CardMedia
                    component="img"
                    image={item.product.image}
                    alt={item.product.title}
                    style={{ width: 80, height: 80 }}
                    className="rounded"
                  />
                  <div>
                    <p className="font-medium">{item.product.title}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} × ${item.product.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {order.status !== "PAID" && (
              <button
                className="mt-4 bg-green-500 px-6 py-2 rounded-lg text-white hover:bg-green-600 transition"
                onClick={() => handlepay(order.id)}
              >
                Pay Now
              </button>
            )}
          </div>
        ))
      )}
    </Card>
  );
}

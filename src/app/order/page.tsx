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
        const res = await axios.get("/api/orders");
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
    try {
      const res = await axios.post("/api/monnifycheckout", {
  email: user.primaryEmailAddress?.emailAddress,
  amount: order.total,
});
    if(res.data){
      window.location.href = res.data.paymenturl
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
            className="border rounded-lg p-4 mb-6 space-y-2"
          >
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
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

            <div className="space-y-3">
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
                    <p>{item.product.title}</p>
                    <p>
                      {item.quantity} × ${item.product.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          {order.status !== "PAID" && (
  <button
    className="bg-green-500 px-4 py-2 rounded-lg text-white"
    onClick={() => handlepay(order.id)}
  >
    Pay
  </button>
)}
          </div>
        ))
      )}
    </Card>
  );
}

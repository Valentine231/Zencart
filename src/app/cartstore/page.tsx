"use client";

import { useCartStore } from "@/Store/cartStore";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";



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
    return <p className="text-center mt-10">Your cart is empty</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      {items.map((item) => (
        <Card
          key={item.id}
          className="flex items-center gap-4 border-b py-4"
        >
          <CardMedia
            component="img"
            image={item.image}
            alt={item.title}
            className="w-20 h-20 object-contain"
          />

          <div className="flex-1">
            <h2 className="font-semibold">{item.title}</h2>
            <p className="text-gray-600">{"$" + item.price}</p>
          </div>

          {/* Quantity controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => decreaseQty(item.id)}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              −
            </button>

            <span className="font-semibold">{item.quantity}</span>

            <button
              onClick={() => increaseQty(item.id)}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              +
            </button>
          </div>

          <button
            onClick={() => removeFromCart(item.id)}
            className="ml-4 text-red-500 hover:underline"
          >
            Remove
          </button>
        </Card>
      ))}

      <div className="text-right mt-6 font-semibold">
        Total: {"$" + total}
      </div>
    </div>
  );
}

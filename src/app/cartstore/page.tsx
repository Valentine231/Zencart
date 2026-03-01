"use client";

import { useCartStore } from "@/Store/cartStore";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import OrderButton from "./Orderbutton";


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
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-center text-lg text-gray-600">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Your Cart</h1>

        {/* Cart Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {items.map((item) => (
            <Card
              key={item.id}
              className="flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200 rounded-lg overflow-hidden bg-white"
            >
              {/* Product Image */}
              <div className="relative w-full h-40 sm:h-48 bg-gray-100 overflow-hidden">
                <CardMedia
                  component="img"
                  image={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="p-4 sm:p-5 flex flex-col flex-grow">
                <h2 className="font-semibold text-sm sm:text-base line-clamp-2 mb-2">
                  {item.title}
                </h2>
                <p className="text-gray-600 text-sm sm:text-base font-semibold mb-4">
                  ${item.price.toFixed(2)}
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Button
                    onClick={() => decreaseQty(item.id)}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-lg font-semibold transition"
                  >
                    −
                  </Button>

                  <span className="font-semibold text-base min-w-8 text-center">
                    {item.quantity}
                  </span>

                  <Button
                    onClick={() => increaseQty(item.id)}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-lg font-semibold transition"
                  >
                    +
                  </Button>
                </div>

                {/* Remove Button */}
                <Button
                  onClick={() => removeFromCart(item.id)}
                  className="w-full py-2 text-red-500 hover:bg-red-50 rounded transition text-sm sm:text-base"
                >
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Cart Summary and Checkout */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-xl sm:text-2xl font-semibold">
              Total: <span className="text-green-600">${total.toFixed(2)}</span>
            </div>
            <OrderButton />
          </div>
        </div>
      </div>
    </div>
  );
}

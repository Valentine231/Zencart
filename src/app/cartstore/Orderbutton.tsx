"use client";

import { useCartStore } from "@/Store/cartStore";
import Button from "@mui/material/Button";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import axios from "axios";

export default function OrderButton() {
  const cartitems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const router = useRouter();
  const { user } = useUser();

  const handleOrder = async () => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }
    try {
      const res = await axios.post('/api/monnifycheckout', {
        email: user.primaryEmailAddress?.emailAddress,
        amount: cartitems.reduce((total, item) => total + item.price * item.quantity, 0),
        total: cartitems.reduce((total, item) => total + item.price * item.quantity, 0),
        userId: user.id,
      });

      const data = res.data;
      if (data.paymentUrl) {
        clearCart();
        window.location.href = data.paymentUrl;
      } else {
        console.error("Payment initiation failed:", data.error);
      }
    } catch (error: any) {
      console.error("Payment error:", error.response?.data?.error || error.message);
    }
  };


  return (
    <Button
      variant="contained"
      startIcon={<ShoppingCartIcon />}
      onClick={handleOrder}
      disabled={cartitems.length === 0}
    >
      Place Order
    </Button>
  );
}

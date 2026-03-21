"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/Store/cartStore";  // zustand store for cart handling

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();                      // added router for navigation
  const clearCart = useCartStore((state)=>state.clearCart)

  const [status, setStatus] = useState<"verifying"|"success"|"failed">("verifying");

  useEffect(() => {
    const reference = searchParams.get("reference");

    if (!reference) return;

    const verifyPayment = async () => {
      try {
        const res = await fetch("/api/verifypayment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reference }),
        });

        const data = await res.json();
        console.log("VERIFY RESPONSE:", data);
        if (res.ok) {
          setStatus("success");
          clearCart();
          // after a short delay show success then redirect back to cartstore
          setTimeout(() => {
            router.push("/order");
          }, 1500);
        } else {
          console.error("Verification failed:", data);
          setStatus("failed");
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        setStatus("failed");
      }
    };

    verifyPayment();
  }, [searchParams, clearCart, router]);

  // improved design: centered card with conditional messages
  return  (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      {status === "verifying" && (
        <div className="p-6 bg-white rounded shadow text-gray-700">
          <h1 className="text-xl font-semibold">Verifying payment...</h1>
          <p className="mt-2">Please wait while we process your transaction.</p>
        </div>
      )}
      {status === "success" && (
        <div className="p-6 bg-green-100 rounded shadow text-green-800">
          <h1 className="text-xl font-semibold">Payment Verified!</h1>
          <p className="mt-2">Redirecting you back to your cart...</p>
        </div>
      )}
      {status === "failed" && (
        <div className="p-6 bg-red-100 rounded shadow text-red-800">
          <h1 className="text-xl font-semibold">Verification Failed</h1>
          <p className="mt-2">Please contact support or try again later.</p>
        </div>
      )}
    </div>
  ) 
}
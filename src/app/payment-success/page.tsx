"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const reference = searchParams.get("reference");

    if (!reference) return;

    const verifyPayment = async () => {
      const res = await fetch("/api/verifypayment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reference }),
      });

      const data = await res.json();
      console.log("VERIFY RESPONSE:", data);
    };

    verifyPayment();
  }, [searchParams]);

  return <h1>Verifying payment...</h1>;
}
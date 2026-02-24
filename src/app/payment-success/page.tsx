"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useRouter } from "next/navigation";

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const paymentReference = searchParams.get("paymentReference");
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <Card className="max-w-md w-full p-8 text-center space-y-6">
                <CheckCircleOutlineIcon
                    sx={{ fontSize: 80, color: "#22c55e" }}
                />

                <h1 className="text-2xl font-bold text-green-600">
                    Payment Successful!
                </h1>

                <p className="text-gray-600">
                    Thank you for your order. Your payment has been processed
                    successfully.
                </p>

                {orderId && (
                    <p className="text-sm text-gray-500">
                        <strong>Order ID:</strong> {orderId}
                    </p>
                )}

                {paymentReference && (
                    <p className="text-sm text-gray-500">
                        <strong>Payment Reference:</strong> {paymentReference}
                    </p>
                )}

                <div className="flex flex-col gap-3 pt-4">
                    <Button
                        variant="contained"
                        onClick={() => router.push("/order")}
                        sx={{
                            backgroundColor: "#22c55e",
                            "&:hover": { backgroundColor: "#16a34a" },
                        }}
                    >
                        View My Orders
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={() => router.push("/")}
                    >
                        Continue Shopping
                    </Button>
                </div>
            </Card>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <p>Loading...</p>
                </div>
            }
        >
            <PaymentSuccessContent />
        </Suspense>
    );
}

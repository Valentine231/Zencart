import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncUserWithClerk } from "@/lib/syncUserWithClerk";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email, amount } = await req.json();

    if (!email || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: email, amount" },
        { status: 400 }
      );
    }

    const user = await syncUserWithClerk();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paymentReference = `Zencart_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total: amount,
        paymentReference,
        status: "PENDING",
      },
    });

    const rateRes = await fetch(
      `https://api.exchangerate.host/convert?from=USD&to=NGN&amount=${amount}&access_key=${process.env.EXCHANGE_API_KEY}`
    );

    const rateData = await rateRes.json();
    console.log(rateData);

    if (!rateData.result) {
      return NextResponse.json(
        { error: "Failed to fetch exchange rate" },
        { status: 500 }
      );
    }

    const amountInNGN = Math.round(rateData.result);
    const amountInKobo = amountInNGN * 100;

    const paystackRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          email,
          amount: amountInKobo,
          reference: paymentReference,
          currency: "NGN",
          callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?orderId=${order.id}`,
          metadata: {
            orderId: order.id,
            userId: user.id,
          },
        }),
      }
    );

    const paystackData = await paystackRes.json();
    console.log("PAYSTACK RESPONSE:", paystackData);

    if (paystackRes.ok && paystackData.status) {
      return NextResponse.json({
        paymentUrl: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
        orderId: order.id,
      });
    } else {
      console.error("PAYSTACK INIT FAILED:", paystackData);
      return NextResponse.json(
        { error: paystackData.message || "Payment initialization failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("PAYMENT ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { reference } = await req.json();

    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    // Verify with Paystack
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const verifyData = await verifyRes.json();
    console.log("VERIFY RESPONSE:", verifyData);

    if (verifyData.status && verifyData.data.status === "success") {
      const paymentReference = verifyData.data.reference;

      // Update order
      await prisma.order.update({
        where: { paymentReference },
        data: {
          status: "PAID",
          transactionRef: verifyData.data.id.toString(),
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false }, { status: 400 });
  } catch (error) {
    console.error("VERIFY ERROR:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
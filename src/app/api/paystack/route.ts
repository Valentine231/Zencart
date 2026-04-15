import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncUserWithClerk } from "@/lib/syncUserWithClerk";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email, amount, orderId, items } = await req.json();

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

    let order;

    if (orderId) {
      // Use existing order
      order = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentReference,
        },
      });
    } else if (items && items.length > 0) {
      // Upsert items into DB so foreign key constraint does not fail for dummyjson products
      for (const item of items) {
        if (!item.productId || !item.title) continue;
        
        let cat = "ACCESSORIES";
        const rawCat = (item.category || "").toLowerCase();
        if (rawCat.includes("jean") || rawCat.includes("men")) cat = "MEN";
        else if (rawCat.includes("cloths") || rawCat.includes("women")) cat = "WOMEN";
        else if (rawCat.includes("glass")) cat = "GLASSES";
        else if (rawCat.includes("footwear") || rawCat.includes("shoe")) cat = "FOOTWEAR";
        else if (rawCat.includes("gadget") || rawCat.includes("electronic")) cat = "GADGETS";

        await prisma.product.upsert({
          where: { id: item.productId },
          update: {},
          create: {
            id: item.productId,
            title: item.title,
            description: item.description || "No description provided",
            price: Number(item.price) || 0,
            image: item.image || "",
            category: cat as any,
          }
        });
      }

      // Create new order with items
      order = await prisma.order.create({
        data: {
          userId: user.id,
          total: amount,
          paymentReference,
          status: "PENDING",
          items: {
            create: items.map((item: any) => ({
              productId: item.productId || item.id,
              quantity: item.quantity || 1,
            })),
          },
        },
      });
    } else {
      // Fallback: Create new order without items (legacy)
      order = await prisma.order.create({
        data: {
          userId: user.id,
          total: amount,
          paymentReference,
          status: "PENDING",
        },
      });
    }

    // Use a configurable NGN/USD rate (set NGN_RATE env var, defaults to 1600)
    // We no longer call the paid exchangerate.host API which caused 500 errors.
    const NGN_RATE = Number(process.env.NGN_RATE) || 1600;
    const amountInNGN = Math.round(amount * NGN_RATE);
    const amountInKobo = amountInNGN * 100;
    console.log(`Converted $${amount} → ₦${amountInNGN} (rate: ${NGN_RATE})`);


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

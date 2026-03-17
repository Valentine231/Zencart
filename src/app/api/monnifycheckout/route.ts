import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncUserWithClerk } from "@/lib/syncUserWithClerk";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email, amount } = await req.json();

    // Validate required fields
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

    // Generate payment reference
    const paymentReference = `Zencart_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    // Create Order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total: amount,
        paymentReference,
        status: "PENDING",
      },
    });

    // Fetch exchange rate
    let amountInNGN: number;
    try {
      const rateRes = await fetch(
        `https://api.exchangerate.host/convert?from=USD&to=NGN&amount=${amount}&access_key=${process.env.EXCHANGE_API_KEY}`,
        { next: { revalidate: 3600 } } // Cache for 1 hour
      );

      const rateData = await rateRes.json();
      console.log("EXCHANGE RATE DATA:", rateData);

      if (rateData && rateData.result) {
        amountInNGN = Math.round(rateData.result);
      } else {
        console.warn("Exchange rate API failed, using fallback rate.");
        // Fallback rate (approximate)
        const FALLBACK_RATE = 1500; 
        amountInNGN = Math.round(amount * FALLBACK_RATE);
      }
    } catch (error) {
      console.error("EXCHANGE RATE FETCH ERROR:", error);
      // Fallback rate (approximate)
      const FALLBACK_RATE = 1500;
      amountInNGN = Math.round(amount * FALLBACK_RATE);
    }



    // 3️⃣ Convert NGN → Kobo
    const amountInKobo = amountInNGN * 100;

    

    // Initialize Paystack transaction
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



// import {NextResponse} from 'next/server';
// import {prisma} from '@/lib/prisma';
// import {syncUserWithClerk} from '@/lib/syncUserWithClerk';

// export const runtime = 'nodejs';

// export async function POST(req:Request) {
//     try {
//         const {email, amount} = await req.json();
        
//         // Validate required fields
//         if (!email || !amount) {
//             return NextResponse.json(
//                 {error: 'Missing required fields: email, amount'}, 
//                 {status: 400}
//             );
//         }

//         const user = await syncUserWithClerk();

//         if (!user) {
//             return NextResponse.json({error: 'Unauthorized'}, {status: 401});
//         }

//         // Generate payment reference ONCE
//         const paymentReference = `Zencart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

//         const order = await prisma.order.create({
//             data: {
//                 userId: user.id,
//                 total: amount,
//                 paymentReference,
//                 status: 'PENDING',
//             },
//         });

//         // Authenticate with Monnify
//         const credentials = Buffer.from(
//             `${process.env.MONNIFY_API_KEY}:${process.env.MONNIFY_SECRET_KEY}`
//         ).toString('base64');

//         const authres = await fetch('https://sandbox.monnify.com/api/v1/auth/login', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 Authorization: `Basic ${credentials}`,
//             },
//         });

//         if (!authres.ok) {
//             const errorData = await authres.json();
//             console.error("AUTH ERROR:", errorData);
//             return NextResponse.json(
//                 {error: 'Failed to authenticate with Monnify'}, 
//                 {status: 500}
//             );
//         }

//         const authData = await authres.json();
//         const accessToken = authData.responseBody.accessToken;

//         // Use the amount from request body with proper conversion
//         const NGNExchangeRate = 1342.60;
//         const amountInNGN = Math.round(amount * NGNExchangeRate);

//         // Initialize transaction with Monnify
//         const paymentRes = await fetch(
//             'https://sandbox.monnify.com/api/v1/merchant/transactions/init-transaction',
//             {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     Authorization: `Bearer ${accessToken}`,
//                 },
//                 body: JSON.stringify({
//                     amount: amountInNGN,
//                     customerName: email.split('@')[0],
//                     customerEmail: email,
//                     contractCode: process.env.MONNIFY_CONTRACT_CODE,
//                     currencyCode: 'NGN',
//                     paymentReference,
//                     redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?orderId=${order.id}`,
//                     paymentDescription: `Order payment for ${email}`,
//                     incomeSplitConfig: [],
//                 }),
//             }
//         );

//         const paymentData = await paymentRes.json();
//         console.log("PAYMENT INIT RESPONSE:", paymentData);
        
//         if (paymentRes.ok && paymentData.requestSuccessful) {
//             return NextResponse.json({
//                 paymentUrl: paymentData.responseBody.checkoutUrl,
//                 transactionReference: paymentData.responseBody.transactionReference,
//                 orderId: order.id,
//             });
//         } else {
//             console.error("PAYMENT INIT FAILED:", paymentData);
//             return NextResponse.json(
//                 {error: paymentData.responseMessage || 'Payment initialization failed'}, 
//                 {status: 500}
//             );
//         }
        
//     } catch (error) {
//         console.error("PAYMENT ERROR:", error);
//         return NextResponse.json(
//             {error: 'Internal server error'}, 
//             {status: 500}
//         );
//     }
// }

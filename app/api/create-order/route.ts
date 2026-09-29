import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const keyId = (process.env.RAZORPAY_KEY_ID || "rzp_live_ThMXlf9dmtDk1W").trim();
const keySecret = (
  process.env.RAZORPAY_KEY_SECRET || "itZZ5vtZsbO3NwjxpVgRfbVj"
).trim();

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export async function POST(req: Request) {
  try {
    const { amount, currency } = await req.json();

    const options = {
      amount: Math.round(amount * 100),
      currency: currency || "USD",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error("Razorpay Order Creation Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.error?.description || "Failed to create order.",
      },
      { status: 500 },
    );
  }
}

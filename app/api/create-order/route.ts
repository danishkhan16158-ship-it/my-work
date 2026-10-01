import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const plans = {
  starter: { amount: 1500, name: "Starter Landing Page" },
  business: { amount: 3000, name: "Business Growth" },
  custom: { amount: 6000, name: "Custom Web Application" },
} as const;
const currencyRates = { INR: 1, USD: 0.012, EUR: 0.011, AED: 0.044 } as const;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const planKey = body?.plan as keyof typeof plans;
    const plan = plans[planKey];
    const currency = body?.currency as keyof typeof currencyRates;

    if (!plan || !Object.prototype.hasOwnProperty.call(plans, planKey)) {
      return NextResponse.json(
        { success: false, message: "Select a valid project plan." },
        { status: 400 },
      );
    }
    if (!Object.prototype.hasOwnProperty.call(currencyRates, currency)) {
      return NextResponse.json(
        { success: false, message: "Select a supported payment currency." },
        { status: 400 },
      );
    }

    const keyId = (
      process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    )?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Razorpay is not configured on the server.",
        },
        { status: 503 },
      );
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const options = {
      amount: Math.round(plan.amount * currencyRates[currency] * 100),
      currency,
      receipt: `danah_${planKey}_${Date.now()}`,
      notes: { plan: plan.name },
    };
    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: unknown) {
    console.error("Razorpay Order Creation Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create a Razorpay order.",
      },
      { status: 500 },
    );
  }
}

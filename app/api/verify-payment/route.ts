import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await request.json();

    const secret =
      process.env.RAZORPAY_KEY_SECRET || "SS73iQ9Jmwozx8GpTlvQXuUV";

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      return NextResponse.json({
        success: true,
        message: "Payment signature verified successfully.",
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid signature verification." },
      { status: 400 },
    );
  } catch (error: any) {
    console.error("Payment Verification Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error during verification." },
      { status: 500 },
    );
  }
}

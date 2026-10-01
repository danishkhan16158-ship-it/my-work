import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      body ?? {};

    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string" ||
      !/^[a-f\d]{64}$/i.test(razorpay_signature)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing or invalid payment verification fields.",
        },
        { status: 400 },
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!secret) {
      return NextResponse.json(
        {
          success: false,
          message: "Razorpay is not configured on the server.",
        },
        { status: 503 },
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const expected = new Uint8Array(32);
    expected.set(Buffer.from(expectedSignature, "hex"));
    const received = new Uint8Array(32);
    received.set(Buffer.from(razorpay_signature, "hex"));
    if (crypto.timingSafeEqual(expected, received)) {
      return NextResponse.json({
        success: true,
        message: "Payment signature verified successfully.",
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid signature verification." },
      { status: 400 },
    );
  } catch (error: unknown) {
    console.error("Payment Verification Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error during verification." },
      { status: 500 },
    );
  }
}

import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getPortalAuthSecret, signPortalPayload } from "@/lib/portal-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OTP_TTL_SECONDS = 60;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function respondToDeliveryFailure(
  message: string,
  otp: string,
  challenge: string,
) {
  console.error("Portal OTP email delivery failed:", message);
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      {
        success: false,
        message:
          "Could not deliver the verification email. Check the Resend sender configuration.",
      },
      { status: 502 },
    );
  }

  const response = NextResponse.json({
    success: true,
    message: "OTP processed in development fallback mode.",
    expiresInSeconds: OTP_TTL_SECONDS,
    devOtp: otp,
  });
  response.cookies.set("danah_otp_challenge", challenge, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    path: "/",
    maxAge: OTP_TTL_SECONDS,
  });
  return response;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone =
      typeof body?.phone === "string" ? body.phone.replace(/\D/g, "") : "";

    if (phone && !email) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Phone OTP is not configured. Use email or configure an SMS provider.",
        },
        { status: 501 },
      );
    }
    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email address." },
        { status: 400 },
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY?.trim();
    const authSecret = getPortalAuthSecret();
    const from =
      process.env.RESEND_FROM_EMAIL?.trim() ||
      (process.env.NODE_ENV !== "production"
        ? "Danah Web <onboarding@resend.dev>"
        : "");

    if (!authSecret) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Portal signing is not configured. Set AUTH_SECRET or BETTER_AUTH_SECRET to at least 32 bytes.",
        },
        { status: 503 },
      );
    }

    const otp = String(crypto.randomInt(100000, 1000000));
    const expiresAt = Date.now() + OTP_TTL_SECONDS * 1000;
    const otpHash = crypto
      .createHmac("sha256", authSecret)
      .update(`${email}|${otp}`)
      .digest("hex");
    const challenge = signPortalPayload(
      { email, otpHash, expiresAt, attempts: 0 },
      authSecret,
    );

    if (!resendApiKey || !from) {
      return respondToDeliveryFailure(
        "RESEND_API_KEY or verified RESEND_FROM_EMAIL is missing.",
        otp,
        challenge,
      );
    }

    try {
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [email],
          subject: "Your Danah Web Client Portal verification code",
          text: `Your Danah Web verification code is ${otp}. It expires in 60 seconds. If you did not request this code, you can ignore this email.`,
          html: `<!doctype html><html><body style="margin:0;background:#050711;color:#f8fafc;font-family:Arial,sans-serif;padding:32px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#10131e;border:1px solid #293044;border-radius:20px"><tr><td style="padding:36px 28px;text-align:center"><p style="margin:0;color:#a5b4fc;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase">DANAH WEB</p><h1 style="margin:20px 0 8px;color:#fff;font-size:24px">Client Portal sign-in</h1><p style="margin:0;color:#a1a1aa;font-size:14px;line-height:1.6">Use this one-time verification code to continue.</p><div style="display:inline-block;margin:28px 0;padding:16px 26px;border:1px solid #6366f1;border-radius:14px;background:#080b15;color:#fff;font-size:32px;font-weight:700;letter-spacing:10px">${otp}</div><p style="margin:0;color:#c4b5fd;font-size:13px">This code expires in 60 seconds.</p><p style="margin:24px 0 0;color:#71717a;font-size:12px;line-height:1.6">If you did not request this code, ignore this message. Do not share your code with anyone.</p></td></tr></table></body></html>`,
        }),
        cache: "no-store",
      });

      if (!resendResponse.ok) {
        const resendError = await resendResponse.json().catch(() => null);
        return respondToDeliveryFailure(
          resendError?.message || `Resend returned ${resendResponse.status}.`,
          otp,
          challenge,
        );
      }
    } catch (error) {
      return respondToDeliveryFailure(
        error instanceof Error ? error.message : "Resend request failed.",
        otp,
        challenge,
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Verification code sent.",
      expiresInSeconds: OTP_TTL_SECONDS,
    });
    response.cookies.set("danah_otp_challenge", challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: OTP_TTL_SECONDS,
    });
    return response;
  } catch (error) {
    console.error("Send portal OTP failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unable to send a verification code right now.",
      },
      { status: 500 },
    );
  }
}

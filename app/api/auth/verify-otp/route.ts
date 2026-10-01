import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  createPortalSession,
  getPortalAuthSecret,
  signPortalPayload,
  verifyPortalPayload,
  type PortalIdentity,
} from "@/lib/portal-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function equalHex(left: string, right: string) {
  if (!/^[a-f\d]{64}$/i.test(left) || !/^[a-f\d]{64}$/i.test(right))
    return false;
  const leftBytes = Buffer.from(left, "hex");
  const rightBytes = Buffer.from(right, "hex");
  const expected = new Uint8Array(leftBytes.byteLength);
  const received = new Uint8Array(rightBytes.byteLength);
  expected.set(leftBytes);
  received.set(rightBytes);
  return crypto.timingSafeEqual(expected, received);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const otp = typeof body?.otp === "string" ? body.otp.trim() : "";
    const token = request.cookies.get("danah_otp_challenge")?.value;
    const secret = getPortalAuthSecret();

    if (!secret) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication is not configured on the server.",
        },
        { status: 503 },
      );
    }
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !/^\d{6}$/.test(otp) ||
      !token
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Enter the email address and 6-digit code from the same sign-in request.",
        },
        { status: 400 },
      );
    }

    const challenge = verifyPortalPayload(token, secret);
    if (
      !challenge ||
      challenge.email !== email ||
      typeof challenge.expiresAt !== "number" ||
      Date.now() > challenge.expiresAt ||
      typeof challenge.otpHash !== "string"
    ) {
      const expired = NextResponse.json(
        {
          success: false,
          message: "This code has expired. Request another code.",
        },
        { status: 400 },
      );
      expired.cookies.delete("danah_otp_challenge");
      return expired;
    }

    const candidateHash = crypto
      .createHmac("sha256", secret)
      .update(`${email}|${otp}`)
      .digest("hex");
    if (!equalHex(challenge.otpHash, candidateHash)) {
      const attempts =
        typeof challenge.attempts === "number" ? challenge.attempts + 1 : 1;
      const response = NextResponse.json(
        {
          success: false,
          message:
            attempts >= 5
              ? "Too many incorrect attempts. Request a new code."
              : "That code is not valid.",
        },
        { status: attempts >= 5 ? 429 : 400 },
      );
      if (attempts >= 5) {
        response.cookies.delete("danah_otp_challenge");
      } else {
        response.cookies.set(
          "danah_otp_challenge",
          signPortalPayload({ ...challenge, attempts }, secret),
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: Math.max(
              1,
              Math.floor((challenge.expiresAt - Date.now()) / 1000),
            ),
          },
        );
      }
      return response;
    }

    const identity: PortalIdentity = {
      fullName: email
        .split("@")[0]
        .replace(/[._-]+/g, " ")
        .replace(/\b\w/g, (letter: string) => letter.toUpperCase()),
      email,
      phone: "",
      companyName: "",
      profilePicture: "",
    };
    const response = NextResponse.json({ success: true, user: identity });
    response.cookies.set(
      "danah_portal_session",
      createPortalSession(identity, secret),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      },
    );
    response.cookies.delete("danah_otp_challenge");
    return response;
  } catch (error) {
    console.error("Verify portal OTP failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to verify the code right now." },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import {
  createPortalSession,
  getPortalAuthSecret,
  type PortalIdentity,
} from "@/lib/portal-auth";
import crypto from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GoogleJwk = {
  kid: string;
  kty: "RSA";
  n: string;
  e: string;
  alg?: string;
};
type GoogleClaims = {
  iss?: string;
  aud?: string | string[];
  azp?: string;
  exp?: number;
  iat?: number;
  nonce?: string;
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
};

let googleJwksCache: { keys: GoogleJwk[]; expiresAt: number } | null = null;

async function getGoogleJwks(forceRefresh = false) {
  if (
    !forceRefresh &&
    googleJwksCache &&
    googleJwksCache.expiresAt > Date.now()
  ) {
    return googleJwksCache.keys;
  }

  const response = await fetch("https://www.googleapis.com/oauth2/v3/certs", {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not retrieve Google signing keys.");

  const result = (await response.json()) as { keys?: GoogleJwk[] };
  if (!Array.isArray(result.keys))
    throw new Error("Google signing keys were invalid.");
  const cacheControl = response.headers.get("cache-control") || "";
  const maxAge = Number(cacheControl.match(/max-age=(\d+)/)?.[1] || 3600);
  googleJwksCache = {
    keys: result.keys,
    expiresAt: Date.now() + maxAge * 1000,
  };
  return result.keys;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const credential =
      typeof body?.credential === "string" ? body.credential : "";
    const nonce = typeof body?.nonce === "string" ? body.nonce : "";
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
    const secret = getPortalAuthSecret();

    if (!clientId || !secret) {
      return NextResponse.json(
        {
          success: false,
          message: "Google sign-in is not configured on the server.",
        },
        { status: 503 },
      );
    }
    if (
      !credential ||
      credential.length > 8192 ||
      !/^[a-f\d]{64}$/i.test(nonce)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid Google credential and sign-in nonce are required.",
        },
        { status: 400 },
      );
    }

    const [encodedHeader, encodedClaims, encodedSignature, ...extra] =
      credential.split(".");
    if (!encodedHeader || !encodedClaims || !encodedSignature || extra.length) {
      return NextResponse.json(
        { success: false, message: "Google credential is malformed." },
        { status: 401 },
      );
    }
    const header = JSON.parse(
      Buffer.from(encodedHeader, "base64url").toString("utf8"),
    ) as { alg?: string; kid?: string };
    const claims = JSON.parse(
      Buffer.from(encodedClaims, "base64url").toString("utf8"),
    ) as GoogleClaims;
    if (header.alg !== "RS256" || typeof header.kid !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Google credential uses an unsupported signature.",
        },
        { status: 401 },
      );
    }

    let jwk = (await getGoogleJwks()).find((key) => key.kid === header.kid);
    if (!jwk) {
      jwk = (await getGoogleJwks(true)).find((key) => key.kid === header.kid);
    }
    if (!jwk) {
      return NextResponse.json(
        { success: false, message: "Google signing key was not recognized." },
        { status: 401 },
      );
    }
    const publicKey = crypto.createPublicKey({ key: jwk, format: "jwk" });
    const signatureValid = crypto.verify(
      "RSA-SHA256",
      Buffer.from(`${encodedHeader}.${encodedClaims}`),
      publicKey,
      Buffer.from(encodedSignature, "base64url"),
    );
    const validIssuer =
      claims.iss === "https://accounts.google.com" ||
      claims.iss === "accounts.google.com";
    const emailVerified =
      claims.email_verified === true || claims.email_verified === "true";
    const audienceMatches = Array.isArray(claims.aud)
      ? claims.aud.includes(clientId)
      : claims.aud === clientId;
    const now = Math.floor(Date.now() / 1000);

    if (
      !signatureValid ||
      !audienceMatches ||
      (claims.azp && claims.azp !== clientId) ||
      !validIssuer ||
      typeof claims.exp !== "number" ||
      claims.exp <= now ||
      typeof claims.iat !== "number" ||
      claims.iat > now + 60 ||
      claims.nonce !== nonce ||
      !emailVerified ||
      typeof claims.email !== "string" ||
      typeof claims.sub !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Google account verification failed." },
        { status: 401 },
      );
    }

    const identity: PortalIdentity = {
      fullName:
        typeof claims.name === "string"
          ? claims.name
          : claims.email.split("@")[0],
      email: claims.email.toLowerCase(),
      phone: "",
      companyName: "",
      profilePicture: typeof claims.picture === "string" ? claims.picture : "",
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
    return response;
  } catch (error) {
    console.error("Google portal sign-in failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unable to complete Google sign-in right now.",
      },
      { status: 500 },
    );
  }
}

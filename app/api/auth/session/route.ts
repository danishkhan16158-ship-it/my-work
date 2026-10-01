import { NextRequest, NextResponse } from "next/server";
import { getPortalAuthSecret, verifyPortalPayload } from "@/lib/portal-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = getPortalAuthSecret();
  const token = request.cookies.get("danah_portal_session")?.value;
  const session = secret && token ? verifyPortalPayload(token, secret) : null;

  if (
    !session ||
    typeof session.exp !== "number" ||
    session.exp <= Date.now() ||
    typeof session.email !== "string" ||
    typeof session.fullName !== "string"
  ) {
    const response = NextResponse.json(
      { success: false, message: "No active portal session." },
      { status: 401 },
    );
    response.cookies.delete("danah_portal_session");
    return response;
  }

  return NextResponse.json({
    success: true,
    user: {
      fullName: session.fullName,
      email: session.email,
      phone: typeof session.phone === "string" ? session.phone : "",
      companyName:
        typeof session.companyName === "string" ? session.companyName : "",
      profilePicture:
        typeof session.profilePicture === "string"
          ? session.profilePicture
          : "",
    },
  });
}

import crypto from "node:crypto";

export type PortalIdentity = {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  profilePicture: string;
};

export function getPortalAuthSecret() {
  const secret =
    process.env.AUTH_SECRET?.trim() ||
    process.env.BETTER_AUTH_SECRET?.trim() ||
    "";
  return Buffer.byteLength(secret, "utf8") >= 32 ? secret : "";
}

export function signPortalPayload(
  payload: Record<string, unknown>,
  secret: string,
) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(encoded)
    .digest("hex");
  return `${encoded}.${signature}`;
}

export function verifyPortalPayload(token: string, secret: string) {
  const [encoded, signature, ...extra] = token.split(".");
  if (
    !encoded ||
    !signature ||
    extra.length ||
    !/^[a-f\d]{64}$/i.test(signature)
  ) {
    return null;
  }

  const expected = crypto.createHmac("sha256", secret).update(encoded).digest();
  const received = Buffer.from(signature, "hex");
  if (received.byteLength !== expected.byteLength) return null;

  const expectedBytes = new Uint8Array(expected.byteLength);
  const receivedBytes = new Uint8Array(received.byteLength);
  expectedBytes.set(expected);
  receivedBytes.set(received);
  if (!crypto.timingSafeEqual(expectedBytes, receivedBytes)) return null;

  try {
    const payload: unknown = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    );
    if (!payload || typeof payload !== "object") return null;
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function createPortalSession(identity: PortalIdentity, secret: string) {
  return signPortalPayload(
    { ...identity, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 },
    secret,
  );
}

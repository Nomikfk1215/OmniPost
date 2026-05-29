import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const VERSION = "v1";
const FALLBACK_SECRET = "omnipost-local-development-secret";

function getEncryptionKey() {
  const secret = process.env.OMNIPOST_ENCRYPTION_KEY ?? FALLBACK_SECRET;
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptSecret(plaintext: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    VERSION,
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url")
  ].join(":");
}

export function decryptSecret(ciphertext: string) {
  const [version, ivValue, tagValue, encryptedValue] = ciphertext.split(":");

  if (version !== VERSION || !ivValue || !tagValue || !encryptedValue) {
    throw new Error("Invalid encrypted secret format");
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(ivValue, "base64url")
  );
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final()
  ]).toString("utf8");
}


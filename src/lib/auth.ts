import { jwtVerify, SignJWT } from "jose";

export const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET || "default_secure_jwt_secret_key_12345!@#$";
  return new TextEncoder().encode(secret);
};

export async function verifyJwtToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return payload;
  } catch (error) {
    return null;
  }
}

export async function signJwtToken(payload: any) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getJwtSecretKey());
    
  return token;
}

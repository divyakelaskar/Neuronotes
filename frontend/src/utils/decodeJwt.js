// utils/jwt.js
export const decodeJWT = (token) => {
  if (!token) return null;

  try {
    const payload = token.split(".")[1]; // JWT is "header.payload.signature"
    const decodedPayload = atob(payload); // base64 decode
    return JSON.parse(decodedPayload);
  } catch (err) {
    console.error("Invalid JWT", err);
    return null;
  }
};

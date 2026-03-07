import admin from "../config/firebase.js";

/**
 * Verifies a Firebase ID token sent in the Authorization header.
 * Attaches `req.user = { uid, email, ... }` for downstream handlers.
 * Returns 401 if the token is missing or invalid.
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    console.warn("[Auth] Request missing Authorization header");
    return res.status(401).json({ error: true, message: "Unauthorized: no token provided." });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // uid, email, name, etc.
    console.log(`[Auth] Verified user: ${decoded.uid}`);
    next();
  } catch (err) {
    console.warn("[Auth] Invalid token:", err.message);
    return res.status(401).json({ error: true, message: "Unauthorized: invalid or expired token." });
  }
}

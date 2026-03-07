import { Router } from "express";
import admin from "../config/firebase.js";
import {
  emailPasswordSchema,
  phoneRequestSchema,
  phoneVerifySchema,
  googleAuthSchema,
  buildUserDocument,
} from "../schema/loginSchema.js";
import { validate } from "../middleware/validate.js";
import { getDb } from "../config/firebase.js";

const router = Router();

// ── Helper: upsert user in Firestore ─────────────────────────────────────────
async function upsertUser(firebaseUser, provider) {
  try {
    const db = getDb();
    const doc = buildUserDocument(firebaseUser, provider);
    await db.collection("users").doc(firebaseUser.uid).set(doc, { merge: true });
    return doc;
  } catch (e) {
    console.warn("[auth] Firestore upsert failed:", e.message);
    return null;
  }
}

// ── POST /api/auth/login/email ────────────────────────────────────────────────
// Verifies a Firebase ID token obtained after email/password sign-in on the client.
router.post("/login/email", validate(emailPasswordSchema), async (req, res, next) => {
  try {
    // The client signs in with Firebase Auth SDK and sends us the ID token to verify
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: true, message: "Firebase ID token missing. Sign in on the client first." });
    }
    const decoded = await admin.auth().verifyIdToken(idToken);
    const firebaseUser = await admin.auth().getUser(decoded.uid);
    const user = await upsertUser(firebaseUser, "email");
    res.json({ success: true, uid: decoded.uid, user });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/login/phone ────────────────────────────────────────────────
// Verifies a Firebase ID token obtained after phone OTP verification on the client.
router.post("/login/phone", validate(phoneVerifySchema), async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: true, message: "Firebase ID token missing." });
    }
    const decoded = await admin.auth().verifyIdToken(idToken);
    const firebaseUser = await admin.auth().getUser(decoded.uid);
    const user = await upsertUser(firebaseUser, "phone");
    res.json({ success: true, uid: decoded.uid, user });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/login/google ───────────────────────────────────────────────
// Verifies a Firebase ID token obtained after Google sign-in on the client.
router.post("/login/google", validate(googleAuthSchema), async (req, res, next) => {
  try {
    const { idToken } = req.body;
    const decoded = await admin.auth().verifyIdToken(idToken);
    const firebaseUser = await admin.auth().getUser(decoded.uid);
    const user = await upsertUser(firebaseUser, "google");
    res.json({ success: true, uid: decoded.uid, user });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
// Returns the Firestore user document for the current token holder.
router.get("/me", async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) return res.status(401).json({ error: true, message: "Authorization header missing." });

    const decoded = await admin.auth().verifyIdToken(token);
    const db = getDb();
    const snap = await db.collection("users").doc(decoded.uid).get();
    if (!snap.exists) return res.status(404).json({ error: true, message: "User not found." });

    res.json({ success: true, user: { id: snap.id, ...snap.data() } });
  } catch (err) {
    next(err);
  }
});

export default router;

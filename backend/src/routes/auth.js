import { Router } from "express";
import admin from "../config/firebase.js";
import { emailPasswordSchema, phoneVerifySchema, googleAuthSchema, buildUserDocument } from "../schema/loginSchema.js";
import { validate } from "../middleware/validate.js";
import { getDb } from "../config/firebase.js";

const router = Router();

async function upsertUser(firebaseUser, provider) {
  try {
    const doc = buildUserDocument(firebaseUser, provider);
    await getDb().collection("users").doc(firebaseUser.uid).set(doc, { merge: true });
    return doc;
  } catch {
    return null;
  }
}

router.post("/login/email", validate(emailPasswordSchema), async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: true, message: "Firebase ID token required." });
    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = await upsertUser(await admin.auth().getUser(decoded.uid), "email");
    res.json({ success: true, uid: decoded.uid, user });
  } catch (err) { next(err); }
});

router.post("/login/phone", validate(phoneVerifySchema), async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: true, message: "Firebase ID token required." });
    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = await upsertUser(await admin.auth().getUser(decoded.uid), "phone");
    res.json({ success: true, uid: decoded.uid, user });
  } catch (err) { next(err); }
});

router.post("/login/google", validate(googleAuthSchema), async (req, res, next) => {
  try {
    const decoded = await admin.auth().verifyIdToken(req.body.idToken);
    const user = await upsertUser(await admin.auth().getUser(decoded.uid), "google");
    res.json({ success: true, uid: decoded.uid, user });
  } catch (err) { next(err); }
});

router.get("/me", async (req, res, next) => {
  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "").trim();
    if (!token) return res.status(401).json({ error: true, message: "Authorization header missing." });
    const decoded = await admin.auth().verifyIdToken(token);
    const snap = await getDb().collection("users").doc(decoded.uid).get();
    if (!snap.exists) return res.status(404).json({ error: true, message: "User not found." });
    res.json({ success: true, user: { id: snap.id, ...snap.data() } });
  } catch (err) { next(err); }
});

export default router;


const EMAIL_RE   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE   = /^\+?[1-9]\d{6,14}$/;   // E.164-compatible
const OTP_RE     = /^\d{6}$/;

function err(field, message) {
  return { valid: false, field, message };
}
const ok = { valid: true };

// ── Schema definitions ────────────────────────────────────────────────────────

/**
 * Email + Password login
 * Body: { email, password }
 */
export const emailPasswordSchema = {
  fields: ["email", "password"],

  validate({ email, password } = {}) {
    if (!email)                       return err("email",    "Email is required.");
    if (!EMAIL_RE.test(email))        return err("email",    "Invalid email address.");
    if (!password)                    return err("password", "Password is required.");
    if (password.length < 8)          return err("password", "Password must be at least 8 characters.");
    return ok;
  },
};

/**
 * Mobile / Phone login — Step 1: request OTP
 * Body: { phone }
 */
export const phoneRequestSchema = {
  fields: ["phone"],

  validate({ phone } = {}) {
    if (!phone)                       return err("phone", "Phone number is required.");
    if (!PHONE_RE.test(phone))        return err("phone", "Invalid phone number. Use E.164 format e.g. +919876543210.");
    return ok;
  },
};

/**
 * Mobile / Phone login — Step 2: verify OTP
 * Body: { phone, otp, sessionInfo }
 */
export const phoneVerifySchema = {
  fields: ["phone", "otp"],

  validate({ phone, otp, sessionInfo } = {}) {
    if (!phone)                       return err("phone", "Phone number is required.");
    if (!PHONE_RE.test(phone))        return err("phone", "Invalid phone number.");
    if (!otp)                         return err("otp",   "OTP is required.");
    if (!OTP_RE.test(otp))            return err("otp",   "OTP must be a 6-digit number.");
    if (!sessionInfo)                 return err("sessionInfo", "Session info token is required.");
    return ok;
  },
};

/**
 * Google OAuth — Continue with Google
 * Body: { idToken }
 *   idToken is the Firebase ID token obtained after Google sign-in on the client.
 */
export const googleAuthSchema = {
  fields: ["idToken"],

  validate({ idToken } = {}) {
    if (!idToken)                     return err("idToken", "Google ID token is required.");
    if (typeof idToken !== "string")  return err("idToken", "ID token must be a string.");
    if (idToken.length < 100)         return err("idToken", "ID token appears invalid.");
    return ok;
  },
};

// ── Firestore User Document Shape ─────────────────────────────────────────────
// Describes what a user record looks like when stored in the "users" collection.

/**
 * Build a Firestore user document from a Firebase Auth user record.
 * @param {import('firebase-admin/auth').UserRecord} firebaseUser
 * @param {'email' | 'phone' | 'google'} provider
 * @returns {Object}
 */
export function buildUserDocument(firebaseUser, provider) {
  return {
    uid:          firebaseUser.uid,
    email:        firebaseUser.email        || null,
    phone:        firebaseUser.phoneNumber  || null,
    displayName:  firebaseUser.displayName  || null,
    photoURL:     firebaseUser.photoURL     || null,
    provider,                                         // 'email' | 'phone' | 'google'
    emailVerified: firebaseUser.emailVerified || false,
    createdAt:    firebaseUser.metadata?.creationTime || new Date().toISOString(),
    lastLoginAt:  new Date().toISOString(),
  };
}

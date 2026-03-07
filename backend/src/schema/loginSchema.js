const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[1-9]\d{6,14}$/;
const OTP_RE   = /^\d{6}$/;

const fail = (field, message) => ({ valid: false, field, message });
const pass = { valid: true };

export const emailPasswordSchema = {
  validate({ email, password } = {}) {
    if (!email)                    return fail("email",    "Email is required.");
    if (!EMAIL_RE.test(email))     return fail("email",    "Invalid email address.");
    if (!password)                 return fail("password", "Password is required.");
    if (password.length < 8)       return fail("password", "Password must be at least 8 characters.");
    return pass;
  },
};

export const phoneVerifySchema = {
  validate({ phone, otp, sessionInfo } = {}) {
    if (!phone)               return fail("phone",       "Phone number is required.");
    if (!PHONE_RE.test(phone))return fail("phone",       "Invalid phone number. Use E.164 format e.g. +919876543210.");
    if (!otp)                 return fail("otp",         "OTP is required.");
    if (!OTP_RE.test(otp))    return fail("otp",         "OTP must be a 6-digit number.");
    if (!sessionInfo)         return fail("sessionInfo", "Session info token is required.");
    return pass;
  },
};

export const googleAuthSchema = {
  validate({ idToken } = {}) {
    if (!idToken)                    return fail("idToken", "Google ID token is required.");
    if (typeof idToken !== "string") return fail("idToken", "ID token must be a string.");
    if (idToken.length < 100)        return fail("idToken", "ID token appears invalid.");
    return pass;
  },
};

export function buildUserDocument(firebaseUser, provider) {
  return {
    uid:          firebaseUser.uid,
    email:        firebaseUser.email        || null,
    phone:        firebaseUser.phoneNumber  || null,
    displayName:  firebaseUser.displayName  || null,
    photoURL:     firebaseUser.photoURL     || null,
    provider,
    emailVerified: firebaseUser.emailVerified || false,
    createdAt:    firebaseUser.metadata?.creationTime || new Date().toISOString(),
    lastLoginAt:  new Date().toISOString(),
  };
}

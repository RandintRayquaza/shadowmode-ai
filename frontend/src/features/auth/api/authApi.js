import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  RecaptchaVerifier, 
  signInWithPhoneNumber 
} from "firebase/auth";
import { auth, googleProvider } from "@/shared/utils/firebase";

export const authApi = {
  /**
   * Log in with email and password
   */
  loginWithEmail: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  },

  /**
   * Sign up with email and password
   */
  signupWithEmail: async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  },

  /**
   * Log in with Google OAuth
   */
  loginWithGoogle: async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      return { user: userCredential.user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  },

  /**
   * Setup Recaptcha for Phone Auth
   */
  setupRecaptcha: (containerId) => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: () => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      }
    });
    return window.recaptchaVerifier;
  },

  /**
   * Send OTP to phone number
   */
  sendPhoneOtp: async (phoneNumber, appVerifier) => {
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Verify Phone OTP
   */
  verifyPhoneOtp: async (otp) => {
    try {
      if (!window.confirmationResult) {
        throw new Error("No confirmation result found. Please request OTP again.");
      }
      const result = await window.confirmationResult.confirm(otp);
      return { user: result.user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  },

  /**
   * Log out
   */
  logout: async () => {
    try {
      await signOut(auth);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

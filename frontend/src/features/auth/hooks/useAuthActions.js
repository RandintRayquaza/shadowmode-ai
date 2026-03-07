import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../state/useAuthStore";
import { authApi } from "../api/authApi";
import { toast } from "sonner";

export const useAuthActions = () => {
  const navigate = useNavigate();
  const { setLoading, setError, clearError } = useAuthStore();

  const handleAuthResponse = (response, successMessage, redirectPath) => {
    setLoading(false);
    if (response.error) {
      setError(response.error);
      toast.error(response.error);
      return false;
    }
    
    clearError();
    if (successMessage) toast.success(successMessage);
    if (redirectPath) navigate(redirectPath);
    return true;
  };

  const login = async (email, password) => {
    setLoading(true);
    const res = await authApi.loginWithEmail(email, password);
    return handleAuthResponse(res, "Welcome back!", "/dashboard");
  };

  const signup = async (email, password) => {
    setLoading(true);
    const res = await authApi.signupWithEmail(email, password);
    return handleAuthResponse(res, "Account created successfully.", "/dashboard");
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    const res = await authApi.loginWithGoogle();
    return handleAuthResponse(res, "Signed in with Google.", "/dashboard");
  };

  const sendOtp = async (phoneNumber, containerId) => {
    setLoading(true);
    try {
      const appVerifier = authApi.setupRecaptcha(containerId);
      const res = await authApi.sendPhoneOtp(phoneNumber, appVerifier);
      setLoading(false);
      if (res.success) {
        toast.success("Verification code sent.");
        return true;
      } else {
        setError(res.error);
        toast.error(res.error);
        return false;
      }
    } catch (error) {
      setLoading(false);
      setError(error.message);
      toast.error(error.message);
      return false;
    }
  };

  const verifyOtp = async (otp) => {
    setLoading(true);
    const res = await authApi.verifyPhoneOtp(otp);
    return handleAuthResponse(res, "Phone verified successfully.", "/dashboard");
  };

  const logout = async () => {
    setLoading(true);
    const res = await authApi.logout();
    setLoading(false);
    if (res.success) {
      toast.success("Logged out.");
      navigate("/");
      return true;
    } else {
      toast.error(res.error);
      return false;
    }
  };

  return {
    login,
    signup,
    loginWithGoogle,
    sendOtp,
    verifyOtp,
    logout,
  };
};

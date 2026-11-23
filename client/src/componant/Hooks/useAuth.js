import toast from "react-hot-toast";
import { useAuthContext } from "./useAuthContext.js";

const getAuthErrorMessage = (error, fallback) => {
  const validationErrors = error?.response?.data?.errors;
  if (validationErrors?.length) return validationErrors.join(". ");

  const serverMessage = error?.response?.data?.message;
  if (serverMessage) return serverMessage;

  if (error?.request) {
    return "Could not reach the server. Check that the SkillBridge API is running.";
  }

  return fallback;
};

export const useAuth = () => {
  const { login: authenticate, register: createAccount } = useAuthContext();

  const login = async (userData) => {
    try {
      if (!userData.email || !userData.password) {
        toast.error("Please fill in all fields");
        return null;
      }

      const user = await authenticate(userData);

      toast.success("Login successful");

      return user;
    } catch (error) {
      if (error.response?.data?.code === "EMAIL_VERIFICATION_REQUIRED") return { verificationRequired: true };
      toast.error(
        getAuthErrorMessage(error, "An error occurred while logging in"),
      );

      return null;
    }
  };
  const register = async (userData) => {
    try {
      if (
        !userData.username ||
        !userData.email ||
        !userData.password ||
        !userData.confirmPassword
      ) {
        toast.error("Please fill in all fields");
        return null;
      }

      const result = await createAccount(userData);

      toast.success("Registration successful");

      return result;
    } catch (error) {
      toast.error(
        getAuthErrorMessage(error, "An error occurred while registering"),
      );

      return null;
    }
  };

  return { login, register };
};

export default useAuth;

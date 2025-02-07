import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const loginWithGoogle = () => {
  window.location.href = `${API_BASE_URL}/api/auth/login/google`;
};

export const logout = () => {
  Cookies.remove("token");
  window.location.reload();
};

export const getSession = async () => {
  const token = Cookies.get("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
};

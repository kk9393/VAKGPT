"use client";
import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

// ✅ Define User Type
interface User {
  userid: string;
  name: string;
  email: string;
  profile_picture?: string;
  exp?: number; // Expiry timestamp
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

// ✅ Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ Function to Check Token Expiration
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: User = jwtDecode(token);
    if (!decoded.exp) return false; // No expiry in token
    return decoded.exp * 1000 < Date.now(); // Convert seconds to ms
  } catch (error) {
    console.error("Invalid token:", error);
    return true; // Assume expired if there's an error
  }
};

// ✅ AuthProvider Component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      if (isTokenExpired(token)) {
        console.warn("🔴 Token expired, logging out...");
        logout();
      } else {
        setUser(jwtDecode<User>(token));
      }
    }
  }, []);

  const login = (token: string) => {
    Cookies.set("token", token, { expires: 7 });
    setUser(jwtDecode<User>(token));
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom Hook for Using Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

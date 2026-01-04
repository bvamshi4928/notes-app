import { createContext, useMemo, useState } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const persistToken = (value) => {
    if (value) {
      localStorage.setItem("token", value);
    } else {
      localStorage.removeItem("token");
    }
    setToken(value);
  };

  const signin = async (email, password) => {
    const res = await api.post("/auth/signin", { email, password });
    const newToken = res.data?.data?.token;
    if (!newToken) throw new Error("Token not returned");
    persistToken(newToken);
  };

  const signup = async (name, email, password) => {
    await api.post("/auth/signup", { name, email, password });
    // auto-signin after successful signup
    await signin(email, password);
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post("/auth/signout");
      }
    } catch (err) {
      // non-blocking: ignore signout errors
      console.warn("Signout request failed", err?.message || err);
    } finally {
      persistToken(null);
    }
  };

  const value = useMemo(() => ({ token, signin, signup, logout }), [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

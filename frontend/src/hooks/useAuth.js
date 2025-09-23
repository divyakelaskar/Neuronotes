import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { decodeJWT } from "../utils/decodeJwt";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decoded = decodeJWT(token);
    if (!decoded) {
      handleLogout();
      return;
    }

    const currentTime = Date.now() / 1000; // seconds
    if (decoded.exp < currentTime) {
      handleLogout();
    } else {
      setUser(decoded);

      const timeout = (decoded.exp - currentTime) * 1000;
      const timer = setTimeout(() => {
        handleLogout();
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/auth");
  };

  return { user, handleLogout };
};

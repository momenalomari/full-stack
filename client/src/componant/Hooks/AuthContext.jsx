import { useEffect, useState } from "react";
import api from "../../api.js";
import { AuthContext } from "./authContext.js";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api
      .get("/auth/me")
      .then(({ data }) => {
        if (active) setUser(data.user || null);
      })
      .catch(() => {
        if (active) {
          // Avoid force-signout on a failed session check.
          // The user should only be logged out when they click the logout button.
          setUser((currentUser) => currentUser ?? null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const { data } = await api.post("/auth/register", userData);
    return data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

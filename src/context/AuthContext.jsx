import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as client from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfileState] = useState(client.getStoredProfile);
  const [checking, setChecking] = useState(true);

  const setProfile = useCallback((p) => {
    client.storeProfile(p);
    setProfileState(p);
  }, []);

  const clear = useCallback(() => {
    setUser(null);
    setProfile(null);
  }, [setProfile]);

  useEffect(() => {
    client.setUnauthorizedHandler(clear);
    client.getMe().then(setUser).catch(() => clear()).finally(() => setChecking(false));
  }, [clear]);

  const value = useMemo(
    () => ({
      user,
      profile,
      checking,
      setProfile,
      login: async (email, password) => {
        const u = await client.login(email, password);
        setProfile(null);
        setUser(u);
        return u;
      },
      acceptInvite: async (token, email, password) => {
        const u = await client.acceptInvite(token, email, password);
        setProfile(null);
        setUser(u);
        return u;
      },
      logout: async () => {
        await client.logout().catch(() => {});
        clear();
      },
    }),
    [user, profile, checking, setProfile, clear]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { supabase } from "../lib/supabase";
import { getProfile } from "../services/authService";

const AuthContext = createContext(null);

// Keeps track of whether an admin is signed in,
// so every page can read it with useAuth().
export function AuthProvider({ children }) {
  // undefined = not checked yet, null = signed out
  const [session, setSession] = useState(undefined);
  const [profileState, setProfileState] = useState({
    userId: null,
    profile: null,
  });

  // Supabase calls this once at startup with the saved session,
  // then again on every sign-in and sign-out.
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const sessionKnown = session !== undefined;
  const userId = session?.user?.id ?? null;

  // Load the profile row (name and role) whenever the signed-in user changes.
  useEffect(() => {
    if (!sessionKnown) return;

    if (!userId) {
      setProfileState({ userId: null, profile: null });
      return;
    }

    let active = true;

    getProfile(userId)
      .then((profile) => {
        if (active) setProfileState({ userId, profile });
      })
      .catch((err) => {
        console.error("Failed to load profile:", err);
        if (active) setProfileState({ userId, profile: null });
      });

    return () => {
      active = false;
    };
  }, [sessionKnown, userId]);

  const value = useMemo(() => {
    // Still loading until we know the session AND have the matching profile.
    const loading = !sessionKnown || profileState.userId !== userId;

    return {
      loading,
      user: session?.user ?? null,
      profile: loading ? null : profileState.profile,
    };
  }, [session, sessionKnown, userId, profileState]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }

  return context;
}

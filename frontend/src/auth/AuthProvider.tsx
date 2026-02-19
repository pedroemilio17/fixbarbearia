import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type Role = "admin" | "client";

type AuthContextType = {
  user: User | null;
  role: Role;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "");

async function resolveRole(session: Session | null): Promise<Role> {
  if (!session?.access_token || !API_BASE_URL) return "client";

  try {
    const res = await fetch(`${API_BASE_URL}/admin/me`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    return res.ok ? "admin" : "client";
  } catch {
    return "client";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>("client");
  const [loading, setLoading] = useState(true);

  const loadFromSession = async (session: Session | null) => {
    const sessionUser = session?.user ?? null;
    setUser(sessionUser);

    if (sessionUser) {
      const r = await resolveRole(session);
      setRole(r);
    } else {
      setRole("client");
    }
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      if (!alive) return;
      await loadFromSession(data.session ?? null);
      if (alive) setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await loadFromSession(session ?? null);
      setLoading(false);
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      role,
      loading,
      signOut: async () => {
        await supabase.auth.signOut();
      },
      refreshRole: async () => {
        const { data } = await supabase.auth.getSession();
        const r = await resolveRole(data.session ?? null);
        setRole(r);
      },
    }),
    [user, role, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

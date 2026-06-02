"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  authLoading: boolean;
}

// null default so useAuth() can detect usage outside Provider
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // 💡 在開發環境下自動模擬登入，防止在本地測試時卡在 Google 登入限制中
    if (process.env.NODE_ENV === "development") {
      setUser({
        id: "mock-user-id",
        email: "agent@overwatch.dev",
        user_metadata: {
          full_name: "測試特工",
          avatar_url: "/images/avatars/avatar_male_calm_square.png"
        }
      } as any);
      setAuthLoading(false);
      return;
    }

    const supabase = createClient();

    // INITIAL_SESSION is the canonical Supabase v2 initial auth source
    // Drop getUser() to avoid dual-path race with INITIAL_SESSION
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/types/auth";

function deriveUserProfile(user: User | null): UserProfile | null {
  if (!user) return null;
  return {
    id: user.id,
    display_name:
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email?.split("@")[0] ??
      "特工",
    avatar_url:
      user.user_metadata?.avatar_url ??
      user.user_metadata?.picture ??
      "/images/avatars/avatar_female_elegant_square.png",
  };
}

interface AuthContextType {
  user: User | null;
  authLoading: boolean;
  userProfile: UserProfile | null;
}

// null default so useAuth() can detect usage outside Provider
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // 💡 在開發環境下自動模擬登入，防止在本地測試時卡在 Google 登入限制中
    if (process.env.NODE_ENV === "development") {
      const mockUser = {
        id: "mock-user-id",
        app_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
        email: "agent@overwatch.dev",
        user_metadata: {
          full_name: "測試特工",
          avatar_url: "/images/avatars/avatar_male_calm_square.png"
        }
      } as User;
      setUser(mockUser);
      setUserProfile(deriveUserProfile(mockUser));
      setAuthLoading(false);
      return;
    }

    const supabase = createClient();
    let cancelled = false;

    // getUser() 提供即時的初始 auth 狀態（解決 Strict Mode 下 onAuthStateChange 延遲問題）
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      setUser(data.user ?? null);
      setUserProfile(deriveUserProfile(data.user ?? null));
      setAuthLoading(false);
    });

    // onAuthStateChange 處理後續變化（登入、登出、token 刷新等）
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      setUser(session?.user ?? null);
      setUserProfile(deriveUserProfile(session?.user ?? null));
      setAuthLoading(false);
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, authLoading, userProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

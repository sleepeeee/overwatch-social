"use client";

import { useAuth } from "@/context/AuthContext";

interface DevModeState {
  isDeveloper: boolean;
  loading: boolean;
}

// UI-only signal: app_metadata.role is readable client-side but not forgeable by users.
// This hook is for display purposes only — any backend developer-only features must
// re-validate the role via RLS policy (auth.jwt()->'app_metadata'->>'role').
export function useDevMode(): DevModeState {
  const isDev = process.env.NODE_ENV === "development";
  const { user, authLoading } = useAuth();

  // Dev bypass: allow testing without a Supabase session locally.
  // If a real session exists, respect the actual role even in dev.
  if (isDev && !user) return { isDeveloper: true, loading: false };

  return {
    isDeveloper: user?.app_metadata?.role === "developer",
    loading: authLoading,
  };
}

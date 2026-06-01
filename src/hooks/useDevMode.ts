"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface DevModeState {
  isDeveloper: boolean;
  loading: boolean;
}

// UI-only signal: app_metadata.role is readable client-side but not forgeable by users.
// This hook is for display purposes only — any backend developer-only features must
// re-validate the role via RLS policy (auth.jwt()->'app_metadata'->>'role').
export function useDevMode(): DevModeState {
  const isDev = process.env.NODE_ENV === "development";
  const [state, setState] = useState<DevModeState>({ 
    isDeveloper: isDev, 
    loading: !isDev 
  });

  useEffect(() => {
    // 🛡️ 開發環境下已在初始化 state 時直接 Bypass，在此處無需執行 supabase 監聽
    if (isDev) return;

    const supabase = createClient();

    // onAuthStateChange 在 mount 時會觸發 INITIAL_SESSION，作為單一 state 來源
    // 避免 getUser() 與 listener callback 的 race condition
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        isDeveloper: session?.user?.app_metadata?.role === "developer",
        loading: false,
      });
    });

    return () => listener.subscription.unsubscribe();
  }, [isDev]);

  return state;
}

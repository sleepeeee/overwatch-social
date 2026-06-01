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
  const [state, setState] = useState<DevModeState>({ isDeveloper: false, loading: true });

  useEffect(() => {
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
  }, []);

  return state;
}

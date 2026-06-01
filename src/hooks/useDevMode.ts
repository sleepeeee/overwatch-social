"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface DevModeState {
  isDeveloper: boolean;
  loading: boolean;
}

export function useDevMode(): DevModeState {
  const [state, setState] = useState<DevModeState>({ isDeveloper: false, loading: true });

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setState({
        isDeveloper: data.user?.app_metadata?.role === "developer",
        loading: false,
      });
    });

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

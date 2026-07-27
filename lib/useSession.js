"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export function useSession() {
  const [state, setState] = useState({
    loading: true,
    user: null,
    profile: null,
    error: null,
  });

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function load() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (userError || !user) {
        setState({ loading: false, user: null, profile: null, error: userError });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!isMounted) return;
      setState({ loading: false, user, profile, error: profileError });
    }

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => load());

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}

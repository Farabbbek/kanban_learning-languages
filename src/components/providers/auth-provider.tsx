"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { createClient } from "@/lib/supabase/client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setDisplayName = useAuthStore((s) => s.setDisplayName);
  const setUsername = useAuthStore((s) => s.setUsername);
  const setAvatarUrl = useAuthStore((s) => s.setAvatarUrl);
  const setStreak = useAuthStore((s) => s.setStreak);
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setUserId = useAuthStore((s) => s.setUserId);
  const setEmail = useAuthStore((s) => s.setEmail);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) {
        if (!cancelled) setHydrated(true);
        return;
      }

      setUserId(user.id);
      setEmail(user.email ?? null);

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, username, avatar_url, bio")
        .eq("id", user.id)
        .single();

      if (!cancelled) {
        if (profile) {
          setProfile(profile, user.email ?? undefined);
        } else {
          setDisplayName(user.email?.split("@")[0] ?? "Learner");
        }

        // Fetch streak
        try {
          const res = await fetch("/api/study/streak");
          const data = await res.json();
          if (typeof data?.streak === "number") setStreak(data.streak);
        } catch {
          // silent
        }

        setHydrated(true);
      }
    };

    hydrate();

    return () => {
      cancelled = true;
    };
  }, [setDisplayName, setUsername, setAvatarUrl, setStreak, setHydrated, setProfile, setUserId, setEmail]);

  return <>{children}</>;
}

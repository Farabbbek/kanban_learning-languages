import { create } from "zustand";

interface ProfileData {
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio?: string | null;
}

interface AuthState {
  // Auth
  userId: string | null;
  email: string | null;

  // Profile
  displayName: string;
  username: string;
  avatarUrl: string;
  streak: number;
  isHydrated: boolean;

  // Actions
  setUserId: (id: string) => void;
  setEmail: (email: string | null) => void;
  setDisplayName: (name: string) => void;
  setUsername: (username: string) => void;
  setAvatarUrl: (url: string) => void;
  setStreak: (streak: number) => void;
  setHydrated: (v: boolean) => void;

  /** Set all profile fields at once (from DB fetch) */
  setProfile: (profile: ProfileData, email?: string) => void;

  /** Partially update profile (used after save) */
  updateProfile: (partial: Partial<ProfileData>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Auth
  userId: null,
  email: null,

  // Profile
  displayName: "",
  username: "",
  avatarUrl: "",
  streak: 0,
  isHydrated: false,

  // Actions
  setUserId: (userId) => set({ userId }),
  setEmail: (email) => set({ email }),

  setDisplayName: (displayName) => set({ displayName }),
  setUsername: (username) => set({ username }),
  setAvatarUrl: (avatarUrl) => set({ avatarUrl }),
  setStreak: (streak) => set({ streak }),
  setHydrated: (isHydrated) => set({ isHydrated }),

  setProfile: (profile, email) =>
    set({
      displayName: profile.display_name ?? "",
      username: profile.username ?? "",
      avatarUrl: profile.avatar_url ?? "",
      email: email ?? null,
    }),

  updateProfile: (partial) =>
    set((state) => ({
      displayName: partial.display_name !== undefined ? (partial.display_name ?? "") : state.displayName,
      username: partial.username !== undefined ? (partial.username ?? "") : state.username,
      avatarUrl: partial.avatar_url !== undefined ? (partial.avatar_url ?? "") : state.avatarUrl,
    })),
}));

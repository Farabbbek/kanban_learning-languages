"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Camera,
  Upload,
  X,
  Trash2,
  Save,
  LogOut,
  Loader2,
  Check,
  AtSign,
  Type,
  Quote,
  Sparkles,
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

/* ──────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────── */

interface ProfileData {
  id: string;
  display_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
}

/* ──────────────────────────────────────────────
   AVATAR UPLOAD
   ────────────────────────────────────────────── */

function AvatarUpload({
  currentUrl,
  displayName,
  onAvatarChange,
}: {
  currentUrl: string | null;
  displayName: string;
  onAvatarChange: (url: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image too large. Maximum 5MB");
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("avatar", file);
        const res = await fetch("/api/settings/avatar", { method: "POST", body: formData });
        if (!res.ok) throw new Error((await res.json()).error || "Upload failed");
        const data = await res.json();
        onAvatarChange(data.avatarUrl);
        toast.success("Photo updated");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [onAvatarChange]
  );

  const handleRemove = useCallback(async () => {
    setIsUploading(true);
    try {
      await fetch("/api/settings/avatar", { method: "DELETE" });
      onAvatarChange("");
      toast.success("Photo removed");
    } catch {
      toast.error("Failed to remove avatar");
    } finally {
      setIsUploading(false);
    }
  }, [onAvatarChange]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar circle */}
      <div className="relative group">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative size-24 cursor-pointer overflow-hidden rounded-full transition-all duration-200 hover:opacity-90"
        >
          {/* Ring */}
          <div className="absolute -inset-[2px] rounded-full border border-[#E8DDD2]" />

          {currentUrl ? (
            <img
              src={currentUrl}
              alt=""
              className="size-full rounded-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center rounded-full bg-[#F3EDE6]">
              <User className="size-8 text-[#B8A99A]" strokeWidth={1.2} />
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 transition-all duration-200 group-hover:opacity-100">
            <Camera className="size-5 text-white" strokeWidth={1.5} />
          </div>
        </div>

        {/* Upload spinner */}
        {isUploading && (
          <div className="absolute -inset-1 flex items-center justify-center rounded-full bg-white/60 backdrop-blur-sm">
            <Loader2 className="size-5 animate-spin text-[#8B7B6B]" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#F3EDE6] px-3 py-1.5 text-xs font-medium text-[#6F5E4F] transition-all duration-150 hover:bg-[#EBE3DA] active:scale-[0.97]"
        >
          <Upload className="size-3" strokeWidth={1.5} />
          {currentUrl ? "Change" : "Upload"}
        </button>

        {currentUrl && (
          <button
            onClick={handleRemove}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#FEF2F0] px-3 py-1.5 text-xs font-medium text-[#C75A42] transition-all duration-150 hover:bg-[#FDE8E3] active:scale-[0.97]"
          >
            <Trash2 className="size-3" strokeWidth={1.5} />
            Remove
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────
   INPUT
   ────────────────────────────────────────────── */

function ProfileInput({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  multiline,
  error,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  multiline?: boolean;
  error?: string;
}) {
  const [focused, setFocused] = useState(false);

  const inputClasses = cn(
    "w-full rounded-xl bg-white/80 px-4 py-[11px] text-sm font-medium text-[#1A110C] placeholder:text-[#B0A092]/60 transition-all duration-150 outline-none",
    "border",
    focused
      ? "border-[#D4BFAE]/60 ring-[2.5px] ring-[#D4BFAE]/15"
      : "border-[#E8DDD2]",
    error && "border-[#C75A42]/60 ring-[2.5px] ring-[#C75A42]/10"
  );

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-medium text-[#8B7B6B]/80">
        <Icon className="size-3" strokeWidth={1.5} />
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          rows={3}
          className={cn(inputClasses, "resize-none")}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className={inputClasses}
        />
      )}
      {error && (
        <p className="text-[11px] font-medium text-[#C75A42]/70">{error}</p>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   SETTINGS PAGE
   ────────────────────────────────────────────── */

export default function SettingsPage() {
  const router = useRouter();
  const setDisplayName = useAuthStore((s) => s.setDisplayName);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const setAvatarUrl = useAuthStore((s) => s.setAvatarUrl);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const [displayName, setDisplayNameLocal] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Fetch ──
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/settings/profile");
        if (!res.ok) {
          if (res.status === 401) router.push("/login");
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        const p = data.profile;
        setProfile(p);
        setDisplayNameLocal(p.display_name || "");
        setUsername(p.username || "");
        setBio(p.bio || "");
      } catch {
        toast.error("Failed to load profile");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [router]);

  // ── Validate ──
  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (!displayName.trim()) e.displayName = "Required";
    if (displayName.length > 50) e.displayName = "Max 50 characters";
    if (username && username.length < 2) e.username = "Min 2 characters";
    if (username && !/^[a-zA-Z0-9_-]+$/.test(username))
      e.username = "Only letters, numbers, hyphens, underscores";
    if (bio && bio.length > 500) e.bio = "Max 500 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [displayName, username, bio]);

  // ── Save ──
  const handleSave = useCallback(async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName.trim(),
          username: username.trim() || null,
          bio: bio.trim() || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 409) {
          setErrors({ username: "Username taken" });
          throw new Error("Username already taken");
        }
        throw new Error(err.error || "Save failed");
      }

      const data = await res.json();
      setProfile(data.profile);
      setDisplayName(data.profile.display_name || "");
      // Sync to global auth store so Sidebar updates instantly
      updateProfile({
        display_name: data.profile.display_name,
        username: data.profile.username,
        avatar_url: data.profile.avatar_url,
      });
      toast.success("Profile saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  }, [displayName, username, bio, validate, setDisplayName, updateProfile]);

  // ── Sign out ──
  const handleSignOut = useCallback(async () => {
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      await supabase.auth.signOut();
      router.push("/login");
    } catch {
      toast.error("Sign out failed");
    }
  }, [router]);

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F2ED]">
        <Sidebar />
        <main className="ml-[220px] flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="size-6 animate-spin rounded-full border-2 border-[#D4BFAE] border-t-[#B8A99A]" />
            <p className="text-sm font-medium text-[#8B7B6B]">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F2ED]">
      <Sidebar />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#fff",
            color: "#1A110C",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: 500,
            border: "1px solid #E8DDD2",
            boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
          },
          success: {
            icon: <Check className="size-4 text-[#7BA37B]" strokeWidth={2.5} />,
          },
        }}
      />

      <main className="ml-[220px]">
        <div className="mx-auto max-w-xl px-8 pt-12 pb-24">
          {/* ── HERO ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10"
          >
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#EBE3DA]/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8B7B6B]/70">
              <Sparkles className="size-2.5" strokeWidth={1.5} />
              Profile
            </div>
            <h1 className="text-[22px] font-semibold tracking-tight text-[#1A110C]">
              Settings
            </h1>
            <p className="mt-1 text-sm text-[#8B7B6B]">
              Manage your LinguaBoard profile.
            </p>
          </motion.div>

          {/* ── PROFILE CARD ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-[#E8DDD2] bg-white px-8 py-8 shadow-sm"
          >
            <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:gap-10">
              {/* Avatar */}
              <div className="shrink-0 pt-1">
                <AvatarUpload
                  currentUrl={profile?.avatar_url || null}
                  displayName={displayName || "U"}
                  onAvatarChange={(url) => {
                    setProfile((p) => (p ? { ...p, avatar_url: url } : p));
                    // Sync avatar to global store immediately
                    setAvatarUrl(url);
                    updateProfile({ avatar_url: url || null });
                  }}
                />
              </div>

              {/* Fields */}
              <div className="flex-1 space-y-4 self-stretch">
                <ProfileInput
                  icon={Type}
                  label="Display Name"
                  value={displayName}
                  onChange={(v) => { setDisplayNameLocal(v); setErrors((e) => ({ ...e, displayName: "" })); }}
                  placeholder="Your name"
                  error={errors.displayName}
                />
                <ProfileInput
                  icon={AtSign}
                  label="Username"
                  value={username}
                  onChange={(v) => { setUsername(v); setErrors((e) => ({ ...e, username: "" })); }}
                  placeholder="your-username"
                  error={errors.username}
                />
                <ProfileInput
                  icon={Quote}
                  label="Bio"
                  value={bio}
                  onChange={(v) => { setBio(v); setErrors((e) => ({ ...e, bio: "" })); }}
                  placeholder="A few words about you..."
                  multiline
                  error={errors.bio}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-[#F0EBE5]" />

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8B7B6B]/60 transition-colors duration-150 hover:text-[#C75A42]"
              >
                <LogOut className="size-3.5" strokeWidth={1.5} />
                Sign Out
              </button>

              <motion.button
                onClick={handleSave}
                disabled={isSaving}
                whileHover={!isSaving ? { scale: 1.02 } : {}}
                whileTap={!isSaving ? { scale: 0.98 } : {}}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1A110C] px-6 py-[11px] text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#2D211A] active:scale-[0.98] disabled:opacity-60"
              >
                {isSaving ? (
                  <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
                ) : (
                  <Save className="size-4" strokeWidth={1.5} />
                )}
                {isSaving ? "Saving..." : "Save Changes"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  ExternalLink,
  Book,
  Video,
  FileText,
  Mic,
  Globe,
  GraduationCap,
  Archive,
  X,
  BookOpen,
  Compass,
  FileUp,
  Trash2,
  Play,
  Download,
  AlertTriangle,
} from "lucide-react";
import { LuxurySelect } from "@/components/ui/luxury-select";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";

/* ──────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────── */

type MaterialCategory =
  | "youtube"
  | "article"
  | "pdf"
  | "vocabulary"
  | "grammar"
  | "podcast"
  | "course"
  | "website"
  | "other";

interface LearningMaterial {
  id: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  category: MaterialCategory;
  notes?: string;
  created_at: string;
  favorite: boolean;
  thumbnail?: string;
  file_path?: string;
  user_id: string;
  is_public?: boolean;
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  } | null;
}

interface ProfilePreview {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

const CATEGORY_ICONS: Record<MaterialCategory, React.ElementType> = {
  youtube: Video,
  article: FileText,
  pdf: FileText,
  vocabulary: Book,
  grammar: BookOpen,
  podcast: Mic,
  course: GraduationCap,
  website: Globe,
  other: Archive,
};

const CATEGORY_LABELS: Record<MaterialCategory, string> = {
  youtube: "YouTube",
  article: "Article",
  pdf: "PDF",
  vocabulary: "Vocabulary",
  grammar: "Grammar",
  podcast: "Podcast",
  course: "Course",
  website: "Website",
  other: "Other",
};

const PRESET_TAGS = [
  "#grammar",
  "#listening",
  "#vocabulary",
  "#youtube",
  "#reading",
  "#ielts",
  "#verbs",
  "#daily",
  "#speaking",
];

const CATEGORY_OPTIONS: MaterialCategory[] = [
  "youtube",
  "article",
  "pdf",
  "vocabulary",
  "grammar",
  "podcast",
  "course",
  "website",
  "other",
];

/* ──────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────── */

function safeDomain(url: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return null;
  }
}

function fileNameFromPath(path: string): string {
  return path.split("/").pop() ?? path;
}

function storagePathFromPublicUrl(url: string): string | null {
  const marker = "/object/public/learning-materials/";
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length));
}

function normalizeExternalUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function getMaterialFileUrl(material: LearningMaterial): string | null {
  return material.file_path || null;
}

function getMaterialFileName(material: LearningMaterial): string {
  const source = material.file_path || material.url || material.title;
  const filename = fileNameFromPath(source.split("?")[0]);
  return filename.includes(".") ? filename : `${material.title || "learning-material"}.pdf`;
}

function openInNewTab(url: string | null) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

async function downloadFile(url: string, filename: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Download failed");
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    openInNewTab(url);
  }
}

/* ──────────────────────────────────────────────
   UPLOAD TO SUPABASE STORAGE
   ────────────────────────────────────────────── */

async function uploadToSupabase(
  userId: string,
  file: File
): Promise<string | null> {
  const supabase = createClient();
  const uniqueName = `${userId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  const { error } = await supabase.storage
    .from("learning-materials")
    .upload(uniqueName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from("learning-materials")
    .getPublicUrl(uniqueName);

  return urlData?.publicUrl ?? null;
}

const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

/* ──────────────────────────────────────────────
   ADD MATERIAL MODAL
   ────────────────────────────────────────────── */

function AddMaterialModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [category, setCategory] = useState<MaterialCategory>("article");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && ACCEPTED_MIME_TYPES.includes(dropped.type)) {
      setFile(dropped);
      if (!title) setTitle(dropped.name.replace(/\.[^.]+$/, ""));
      setCategory(
        dropped.type === "application/pdf" ? "pdf" : "other"
      );
    }
  }, [title]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected && ACCEPTED_MIME_TYPES.includes(selected.type)) {
        setFile(selected);
        if (!title) setTitle(selected.name.replace(/\.[^.]+$/, ""));
        setCategory(
          selected.type === "application/pdf" ? "pdf" : "other"
        );
      }
    },
    [title]
  );

  const removeFile = useCallback(() => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);

    const tags = tagsInput
      .split(/[, ]+/)
      .map((t) => t.replace(/^#/, "").trim())
      .filter(Boolean);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    // Upload file if present
    let filePath: string | null = null;
    if (file) {
      setUploading(true);
      filePath = await uploadToSupabase(user.id, file);
      setUploading(false);
    }

    const insertData: Record<string, unknown> = {
      user_id: user.id,
      title: title.trim(),
      description: description.trim(),
      url: url.trim() || null,
      tags,
      category: file
        ? file.type === "application/pdf"
          ? "pdf"
          : "other"
        : category,
      notes: notes.trim() || null,
    };

    if (filePath) {
      insertData.file_path = filePath;
    }

    const { error } = await supabase.from("learning_materials").insert({
      ...insertData,
      is_public: true,
    });

    setSaving(false);
    if (!error) {
      setTitle("");
      setDescription("");
      setUrl("");
      setTagsInput("");
      setCategory("article");
      setNotes("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onCreated();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-[#2A211C]/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="relative w-full max-w-[560px] rounded-[28px] border border-[rgba(210,190,170,0.18)] max-h-[90vh] overflow-y-auto"
              style={{
                background:
                  "linear-gradient(160deg, rgba(250,246,240,0.97), rgba(243,238,230,0.98))",
                backdropFilter: "blur(24px)",
                boxShadow:
                  "0 40px 100px rgba(42,33,28,0.2), 0 0 0 1px rgba(255,255,255,0.3) inset",
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-[28px] opacity-[0.015] mix-blend-multiply"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                }}
              />
              <div className="relative z-10 p-7">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-xl font-semibold tracking-tight text-[#2A211C]">
                      Add Material
                    </h2>
                    <p className="mt-0.5 text-sm text-[#8d8175]">
                      Share a learning resource with the community
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="flex size-8 items-center justify-center rounded-full text-[#8d8175] transition-colors hover:bg-[rgba(210,190,170,0.2)] hover:text-[#2A211C]"
                  >
                    <X className="size-4" strokeWidth={1.5} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#8d8175]">
                      Upload PDF / DOCX / TXT / XLSX
                    </label>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative cursor-pointer rounded-[16px] border-2 border-dashed p-6 text-center transition-all duration-200 ${
                        dragOver
                          ? "border-[#D88A5B]/50 bg-[#D88A5B]/5"
                          : file
                            ? "border-[#2A211C]/20 bg-[rgba(42,33,28,0.02)]"
                            : "border-[rgba(210,190,170,0.3)] bg-[rgba(255,255,255,0.2)] hover:border-[#D88A5B]/25 hover:bg-[#D88A5B]/3"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      {file ? (
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-[10px] bg-[#D88A5B]/10">
                              <FileText className="size-5 text-[#D88A5B]" strokeWidth={1.5} />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-medium text-[#2A211C] truncate max-w-[280px]">{file.name}</p>
                              <p className="text-[11px] text-[#8d8175]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <button type="button" onClick={(e) => { e.stopPropagation(); removeFile(); }}
                            className="flex size-7 items-center justify-center rounded-full text-[#8d8175]/50 hover:bg-[rgba(210,190,170,0.15)] hover:text-red-400 shrink-0"
                          >
                            <X className="size-3.5" strokeWidth={1.8} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex size-10 items-center justify-center rounded-full bg-[rgba(210,190,170,0.1)]">
                            <FileUp className="size-5 text-[#8d8175]/50" strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="text-sm text-[#8d8175]">
                              <span className="font-medium text-[#2A211C]">Click to upload</span> or drag and drop
                            </p>
                            <p className="mt-0.5 text-[11px] text-[#8d8175]/60">PDF, DOCX, TXT, XLSX up to 10MB</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#8d8175]">Title *</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Spanish Verb Conjugation Guide"
                      className="w-full rounded-[14px] border border-[rgba(210,190,170,0.25)] bg-white/60 px-4 py-3 text-sm text-[#2A211C] placeholder:text-[#8d8175]/50 transition-all duration-200 focus:border-[#D88A5B]/40 focus:outline-none focus:ring-[3px] focus:ring-[#D88A5B]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#8d8175]">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of this resource..."
                      rows={2}
                      className="w-full rounded-[14px] border border-[rgba(210,190,170,0.25)] bg-white/60 px-4 py-3 text-sm text-[#2A211C] placeholder:text-[#8d8175]/50 transition-all duration-200 focus:border-[#D88A5B]/40 focus:outline-none focus:ring-[3px] focus:ring-[#D88A5B]/10 resize-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#8d8175]">External URL (optional)</label>
                    <input value={url} onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-[14px] border border-[rgba(210,190,170,0.25)] bg-white/60 px-4 py-3 text-sm text-[#2A211C] placeholder:text-[#8d8175]/50 transition-all duration-200 focus:border-[#D88A5B]/40 focus:outline-none focus:ring-[3px] focus:ring-[#D88A5B]/10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#8d8175]">Category</label>
                      <LuxurySelect
                        options={CATEGORY_OPTIONS.map((cat) => ({ value: cat, label: CATEGORY_LABELS[cat] }))}
                        value={category}
                        onChange={(val) => setCategory(val as MaterialCategory)}
                        placeholder="Select category"
                        className="w-full"
                        triggerClassName="!rounded-[14px] text-sm py-2.5 border-[rgba(210,190,170,0.25)] bg-white/60"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#8d8175]">Tags</label>
                      <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
                        placeholder="#grammar #verbs"
                        className="w-full rounded-[14px] border border-[rgba(210,190,170,0.25)] bg-white/60 px-4 py-3 text-sm text-[#2A211C] placeholder:text-[#8d8175]/50 transition-all duration-200 focus:border-[#D88A5B]/40 focus:outline-none focus:ring-[3px] focus:ring-[#D88A5B]/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#8d8175]">Notes (optional)</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                      placeholder="Personal notes about this resource..."
                      rows={2}
                      className="w-full rounded-[14px] border border-[rgba(210,190,170,0.25)] bg-white/60 px-4 py-3 text-sm text-[#2A211C] placeholder:text-[#8d8175]/50 transition-all duration-200 focus:border-[#D88A5B]/40 focus:outline-none focus:ring-[3px] focus:ring-[#D88A5B]/10 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose}
                      className="rounded-[14px] px-5 py-2.5 text-sm font-medium text-[#8d8175] transition-colors hover:text-[#2A211C]"
                    >
                      Cancel
                    </button>
                    <button type="submit" disabled={saving || uploading || !title.trim()}
                      className="rounded-[14px] bg-[#2A211C] px-6 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:bg-[#3D322B] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {uploading ? "Uploading..." : saving ? "Saving..." : "Share with Community"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ──────────────────────────────────────────────
   CATEGORY BADGE CONFIG
   ────────────────────────────────────────────── */

interface BadgeStyle {
  label: string;
  bg: string;
  text: string;
  border: string;
}

const CATEGORY_BADGE: Record<MaterialCategory, BadgeStyle> = {
  youtube: { label: "YOUTUBE", bg: "rgba(215,120,80,0.14)", text: "#d17a52", border: "rgba(215,120,80,0.22)" },
  pdf: { label: "PDF", bg: "rgba(70,50,40,0.08)", text: "#5a463d", border: "rgba(70,50,40,0.14)" },
  article: { label: "ARTICLE", bg: "rgba(160,140,100,0.10)", text: "#7d6d4a", border: "rgba(160,140,100,0.16)" },
  vocabulary: { label: "VOCABULARY", bg: "rgba(110,140,100,0.10)", text: "#5d7a50", border: "rgba(110,140,100,0.16)" },
  grammar: { label: "GRAMMAR", bg: "rgba(160,120,140,0.10)", text: "#7d6070", border: "rgba(160,120,140,0.16)" },
  podcast: { label: "PODCAST", bg: "rgba(130,120,160,0.10)", text: "#6d5d8d", border: "rgba(130,120,160,0.16)" },
  course: { label: "COURSE", bg: "rgba(100,140,160,0.10)", text: "#4d7a8d", border: "rgba(100,140,160,0.16)" },
  website: { label: "WEBSITE", bg: "rgba(120,120,120,0.08)", text: "#6d6d6d", border: "rgba(120,120,120,0.12)" },
  other: { label: "NOTE", bg: "rgba(140,130,120,0.08)", text: "#7d7268", border: "rgba(140,130,120,0.12)" },
};

/* ──────────────────────────────────────────────
   YOUTUBE THUMBNAIL HELPER
   ────────────────────────────────────────────── */

function isYoutubeUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return hostname.includes("youtube.com") || hostname.includes("youtu.be");
  } catch { return false; }
}

function getYoutubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.slice(1) || null;
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.includes("/shorts/")) return parsed.pathname.split("/shorts/")[1]?.split("/")[0] || null;
      return parsed.searchParams.get("v");
    }
    return null;
  } catch { return null; }
}

/* ──────────────────────────────────────────────
   MATERIAL CARD
   ────────────────────────────────────────────── */

function MaterialCard({
  material,
  onTagClick,
  onDelete,
  currentUserId,
}: {
  material: LearningMaterial;
  onTagClick: (tag: string) => void;
  onDelete: (material: LearningMaterial) => void;
  currentUserId: string | null;
}) {
  const Icon = CATEGORY_ICONS[material.category] || Archive;
  const domain = safeDomain(material.url);
  const hasFile = !!material.file_path;
  const hasYoutubeUrl = material.url ? isYoutubeUrl(material.url) : false;
  const hasOtherUrl = material.url && !hasYoutubeUrl && material.category !== "youtube";
  const isPdfCategory = material.category === "pdf";
  const badge = CATEGORY_BADGE[material.category] || CATEGORY_BADGE.other;
  const normalizedUrl = material.url ? normalizeExternalUrl(material.url) : null;
  const fileUrl = getMaterialFileUrl(material);
  const fileName = getMaterialFileName(material);

  const showYoutubePreview = hasYoutubeUrl || material.category === "youtube";
  const showPdfPreview = (hasFile && isPdfCategory) || isPdfCategory;

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric",
  }).format(new Date(material.created_at));

  const resourceBadges: string[] = [];
  if (hasFile) resourceBadges.push("PDF");
  if (hasYoutubeUrl) resourceBadges.push("YOUTUBE");
  if (hasOtherUrl) resourceBadges.push("LINK");

  const [ytThumbLoaded, setYtThumbLoaded] = useState(false);
  const [ytThumbError, setYtThumbError] = useState(false);

  const youtubeId = showYoutubePreview && material.url ? getYoutubeId(material.url) : null;
  const youtubeThumbSrc = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null;
  const canDelete = currentUserId === material.user_id;
  const primaryUrl = hasYoutubeUrl || hasOtherUrl || material.category === "youtube" ? normalizedUrl : fileUrl;

  const handleOpenPrimary = useCallback(() => {
    openInNewTab(primaryUrl);
  }, [primaryUrl]);

  const handleOpenUrl = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    openInNewTab(normalizedUrl);
  }, [normalizedUrl]);

  const handleOpenFile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    openInNewTab(fileUrl);
  }, [fileUrl]);

  const handleDownloadFile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileUrl) void downloadFile(fileUrl, fileName);
  }, [fileName, fileUrl]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onClick={handleOpenPrimary}
      role={primaryUrl ? "button" : undefined}
      tabIndex={primaryUrl ? 0 : undefined}
      onKeyDown={(e) => {
        if (primaryUrl && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleOpenPrimary();
        }
      }}
      className="group relative overflow-hidden rounded-[24px] border border-[rgba(210,190,170,0.14)] transition-all duration-[400ms] ease-out hover:-translate-y-[4px] hover:shadow-[0_32px_80px_rgba(42,33,28,0.13),0_0_0_1px_rgba(216,138,91,0.15)_inset] cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#D88A5B]/12"
      style={{
        background: "linear-gradient(165deg, rgba(255,255,255,0.6), rgba(250,246,240,0.4), rgba(243,238,230,0.2))",
        boxShadow: "0 12px 36px rgba(42,33,28,0.04), 0 0 0 1px rgba(255,255,255,0.5) inset, 0 -1px 0 rgba(255,255,255,0.7) inset",
      }}
    >
      <div className="pointer-events-none absolute -inset-2 rounded-[28px] bg-gradient-to-br from-[#D88A5B]/4 to-transparent opacity-0 blur-2xl transition-opacity duration-[400ms] group-hover:opacity-100" />

      {/* Preview Area */}
      <div className="relative h-[175px] overflow-hidden rounded-t-[24px] border-b border-[rgba(210,190,170,0.06)]">
        {showYoutubePreview && (
          <div className="relative h-full w-full overflow-hidden transition-transform duration-300 group-hover:scale-[1.03]">
            {!ytThumbLoaded && !ytThumbError && (
              <div className="absolute inset-0 animate-pulse bg-[rgba(210,190,170,0.1)]" />
            )}
            {youtubeThumbSrc && !ytThumbError && (
              <img
                src={youtubeThumbSrc}
                alt=""
                className={`h-full w-full object-cover transition-opacity duration-500 ${ytThumbLoaded ? "opacity-100" : "opacity-0 absolute"}`}
                onLoad={() => setYtThumbLoaded(true)}
                onError={() => setYtThumbError(true)}
              />
            )}
            {(ytThumbError || !youtubeThumbSrc) && (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[rgba(216,138,91,0.08)] to-[rgba(216,138,91,0.02)]" />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(42,33,28,0.35)] via-transparent to-[rgba(42,33,28,0.05)]" />
            {hasFile && (
              <button
                type="button"
                onClick={handleOpenFile}
                className="absolute bottom-[16px] right-[16px] z-20 flex h-[28px] items-center gap-[7px] rounded-full px-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] backdrop-blur-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-200 hover:scale-105 group-hover:translate-y-[-1px]"
                style={{ backgroundColor: "rgba(40,32,28,0.82)", color: "#f0dcc8", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <FileText className="size-[13px] text-[#f0dcc8]/70" strokeWidth={1.7} /> PDF
              </button>
            )}
          </div>
        )}

        {!showYoutubePreview && showPdfPreview && (
          <div className="relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[rgba(210,190,170,0.1)] to-[rgba(210,190,170,0.03)] transition-transform duration-300 group-hover:scale-[1.03]">
            <div className="relative flex flex-col items-center rounded-[12px] border px-6 py-4"
              style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.7), rgba(250,246,240,0.4))", borderColor: "rgba(210,190,170,0.2)" }}
            >
              <FileText className="size-7 text-[#8d7a68]/60" strokeWidth={1.3} />
              <div className="mt-2 flex flex-col items-center gap-1">
                <div className="h-[3px] w-24 rounded-full bg-[#8d7a68]/30" />
                <div className="h-[3px] w-16 rounded-full bg-[#8d7a68]/20" />
                <div className="h-[3px] w-20 rounded-full bg-[#8d7a68]/15" />
              </div>
            </div>
          </div>
        )}

        {!showYoutubePreview && !showPdfPreview && (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[rgba(210,190,170,0.04)] to-[rgba(210,190,170,0.01)]">
            <div className="flex size-14 items-center justify-center rounded-[14px] bg-[rgba(255,255,255,0.4)] border border-[rgba(210,190,170,0.15)]">
              <Icon className="size-7 text-[#8d8175/30]" strokeWidth={1.3} />
            </div>
          </div>
        )}

        {showYoutubePreview && normalizedUrl && (
          <button type="button" onClick={handleOpenUrl} className="absolute inset-0 z-10 flex items-center justify-center" aria-label="Open YouTube video">
            <div className="flex size-16 items-center justify-center rounded-full bg-[rgba(42,33,28,0.75)] shadow-[0_8px_30px_rgba(0,0,0,0.2)] backdrop-blur-[2px] transition-all duration-300 group-hover:scale-110">
              <Play className="ml-1 size-7 text-white" fill="white" strokeWidth={0} />
            </div>
          </button>
        )}

        {canDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(material);
            }}
            title="Delete material"
            className="absolute right-3 top-3 z-30 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-2 text-[11px] font-semibold text-[#b75542] shadow-[0_10px_26px_rgba(42,33,28,0.14)] ring-1 ring-[#b75542]/12 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#fff7f4] hover:ring-[#b75542]/24"
          >
            <Trash2 className="size-3.5" strokeWidth={1.5} />
            Delete
          </button>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 z-15 h-24 bg-gradient-to-b from-[rgba(0,0,0,0.38)] to-[rgba(0,0,0,0.02)]" />

        <div className="absolute left-[18px] top-[18px] z-20 flex flex-col gap-[10px]">
          {resourceBadges.length > 1 && resourceBadges.slice(1).map((rb) => (
            <button
              type="button"
              key={rb}
              onClick={rb === "YOUTUBE" ? handleOpenUrl : handleOpenFile}
              className="flex h-[30px] items-center gap-[6px] rounded-full px-3.5 text-[11px] font-bold uppercase tracking-[0.16em] backdrop-blur-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.22)] transition-all duration-200"
              style={{
                backgroundColor: "rgba(22,18,16,0.88)", color: "#f2d5b7",
                border: "1px solid rgba(242,213,183,0.20)",
              }}
            >
              {rb === "YOUTUBE" ? <Play className="size-[15px] opacity-90" fill="none" strokeWidth={1.8} /> : <FileText className="size-[15px] opacity-80" strokeWidth={1.6} />}
              {rb}
            </button>
          ))}
          <button
            type="button"
            onClick={hasYoutubeUrl ? handleOpenUrl : hasFile ? handleOpenFile : handleOpenPrimary}
            className="flex h-[30px] items-center gap-[6px] rounded-full px-3.5 text-[11px] font-bold uppercase tracking-[0.16em] backdrop-blur-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.22)] transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: "rgba(22,18,16,0.88)", color: "#f2d5b7",
              border: "1px solid rgba(242,213,183,0.20)",
            }}
          >
            {badge.label}
          </button>
        </div>

        {domain && normalizedUrl && (
          <button
            type="button"
            onClick={handleOpenUrl}
            className="absolute bottom-[16px] left-[16px] z-20 flex h-[26px] items-center gap-[6px] rounded-full px-3 text-[10px] font-semibold uppercase tracking-[0.08em] backdrop-blur-[10px] shadow-[0_8px_20px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.06)] transition-transform hover:scale-105"
            style={{ backgroundColor: "rgba(18,14,12,0.72)", color: "rgba(255,245,235,0.80)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {hasYoutubeUrl ? <Play className="size-[11px] text-[#f2d4bc]/70" fill="none" strokeWidth={2} /> : <Globe className="size-[11px] text-[rgba(255,245,235,0.60)]" strokeWidth={1.8} />}
            <span className="truncate max-w-[120px]">{domain}</span>
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="relative z-10 px-5 py-4">
        <h3 className="mb-1.5 font-serif text-[18px] font-semibold leading-snug tracking-tight text-[#1F1610]">
          {material.title}
        </h3>

        {material.description && (
          <p className="mb-3 line-clamp-2 text-[13px] leading-relaxed text-[#6B5D52]/70">
            {material.description}
          </p>
        )}

        {material.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {material.tags.map((tag) => (
              <button
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick(`#${tag}`);
                }}
                className="rounded-full bg-[rgba(210,190,170,0.1)] px-3 py-1 text-[11px] font-medium text-[#8d8175] transition-all duration-200 hover:bg-[#D88A5B]/10 hover:text-[#D88A5B]"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        <div className="mt-2 flex items-center justify-between border-t border-[rgba(210,190,170,0.1)] pt-3">
          <div className="flex items-center gap-2 min-w-0">
            {material.profiles ? (
              <>
                <div className="size-6 shrink-0 overflow-hidden rounded-full bg-[rgba(210,190,170,0.15)] ring-1 ring-[rgba(210,190,170,0.1)]">
                  {material.profiles.avatar_url ? (
                    <img src={material.profiles.avatar_url} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center text-[10px] font-semibold text-[#8d8175]">
                      {(material.profiles.username?.[0] || "?").toUpperCase()}
                    </div>
                  )}
                </div>
                {material.profiles.username && (
                  <span className="truncate text-[11px] font-medium text-[#2A211C]/70">
                    @{material.profiles.username}
                  </span>
                )}
              </>
            ) : null}
          </div>
          <span className="shrink-0 text-[10px] text-[#8d8175]/40">{formattedDate}</span>
        </div>

        {(normalizedUrl || fileUrl) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {normalizedUrl && (
              <button
                type="button"
                onClick={handleOpenUrl}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#D88A5B]/14 bg-[#D88A5B]/10 px-3 py-1.5 text-[11px] font-semibold text-[#8a5a3b] transition-colors hover:border-[#D88A5B]/28 hover:bg-[#D88A5B]/15"
              >
                {hasYoutubeUrl ? <Play className="size-3" strokeWidth={1.8} /> : <ExternalLink className="size-3" strokeWidth={1.8} />}
                Open
              </button>
            )}
            {fileUrl && (
              <>
                <button
                  type="button"
                  onClick={handleOpenFile}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#2A211C]/10 bg-white/55 px-3 py-1.5 text-[11px] font-semibold text-[#5a463d] transition-colors hover:bg-white"
                >
                  <FileText className="size-3" strokeWidth={1.8} />
                  View PDF
                </button>
                <button
                  type="button"
                  onClick={handleDownloadFile}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#2A211C]/10 bg-white/55 px-3 py-1.5 text-[11px] font-semibold text-[#5a463d] transition-colors hover:bg-white"
                >
                  <Download className="size-3" strokeWidth={1.8} />
                  Download
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   EMPTY STATE
   ────────────────────────────────────────────── */

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="relative mb-8">
        <div className="flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-[rgba(216,138,91,0.08)] to-[rgba(210,190,170,0.04)] shadow-[inset_0_0_0_1px_rgba(216,138,91,0.08)]">
          <Compass className="size-10 text-[#D88A5B]/40" strokeWidth={1.2} />
        </div>
      </div>

      <h3 className="font-serif text-2xl font-semibold tracking-tight text-[#2A211C]">
        {hasFilters ? "No matching materials" : "No resources yet"}
      </h3>
      <p className="mt-2 max-w-sm text-center text-sm text-[#8d8175]">
        {hasFilters
          ? "Try adjusting your search or filters."
          : "Be the first to share a learning resource with the community!"}
      </p>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   HERO SECTION
   ────────────────────────────────────────────── */

function LearnHero({ materialCount }: { materialCount: number }) {
  const particleContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const particles = particleContainerRef.current;
    if (!particles) return;
    const animFrame = () => requestAnimationFrame(animFrame);
    const id = requestAnimationFrame(animFrame);
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="relative mb-8 overflow-hidden rounded-[28px] border border-[rgba(210,190,170,0.14)] shadow-[0_18px_54px_rgba(42,33,28,0.04)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-8 -top-12 size-[420px] opacity-60"
          style={{ background: "radial-gradient(circle at left top, rgba(230,190,150,0.16), transparent 60%)" }}
        />
        <div className="absolute -right-16 -top-16 size-[320px] rounded-full bg-[#D88A5B]/3 blur-[60px]" />
        <div className="absolute -bottom-16 -left-16 size-[280px] rounded-full bg-[rgba(210,190,170,0.10)] blur-[60px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.015] mix-blend-multiply"
          style={{
            backgroundImage: `
              radial-gradient(circle at 80% 20%, rgba(210,180,140,0.2) 0%, transparent 50%),
              radial-gradient(circle at 20% 80%, rgba(210,180,140,0.15) 0%, transparent 40%)
            `,
          }}
        />
        <div ref={particleContainerRef} className="absolute inset-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div key={i}
              className="absolute size-1.5 rounded-full bg-[#D88A5B]"
              style={{ left: `${15 + i * 12}%`, top: `${20 + (i % 3) * 25}%`, opacity: 0.04 }}
              animate={{ y: [0, -4, 0], opacity: [0.03, 0.06, 0.03] }}
              transition={{ duration: 4 + i * 0.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }}
            />
          ))}
        </div>
      </div>

      <div
        className="relative px-8 py-9"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.5), rgba(250,246,240,0.3), rgba(243,238,230,0.1))" }}
      >
        <div className="flex items-start justify-between">
          <div className="max-w-[620px]">
            <div className="mb-2.5 flex items-center gap-2.5">
              <BookOpen className="size-[18px] text-[#d98752]" strokeWidth={1.6} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d98752]">
                Community Library
              </span>
            </div>

            <h1 className="font-serif text-[36px] font-bold leading-[1.05] tracking-tight text-[#2B1D17]">
              Learning Library
            </h1>
            <p className="mt-2.5 max-w-[580px] text-[15px] leading-relaxed text-[#7B6B61]">
              Discover language resources shared by the community.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {["#youtube", "#pdf", "#notes", "#community"].map((tag) => (
                <motion.span key={tag}
                  className="rounded-full border border-[rgba(210,190,170,0.18)] bg-[rgba(210,190,170,0.10)] px-3 py-1 text-[10px] font-medium tracking-wide text-[#8d8175]/60"
                  whileHover={{ y: -1, opacity: 0.85 }}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </div>

          <div className="hidden md:flex flex-col items-end gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative rounded-[20px] border border-[rgba(210,190,170,0.16)] px-6 py-5 backdrop-blur-[8px] shadow-[0_12px_40px_rgba(80,52,32,0.08)]"
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.50), rgba(250,246,240,0.25))",
                boxShadow: "0 12px 40px rgba(80,52,32,0.08), 0 0 0 1px rgba(255,255,255,0.4) inset",
              }}
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="relative flex size-[44px] items-center justify-center rounded-full border border-[rgba(216,138,91,0.18)]"
                  style={{ background: "linear-gradient(135deg, rgba(216,138,91,0.12), rgba(216,138,91,0.04))" }}
                >
                  <Compass className="size-[22px] text-[#d98752]/60" strokeWidth={1.3} />
                </div>
                <div>
                  <p className="font-serif text-[28px] font-bold leading-none tracking-tight text-[#2B1D17]">
                    {materialCount}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8d8175]/65">
                    Community Resources
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   MAIN PAGE COMPONENT
   ────────────────────────────────────────────── */

export default function LearnPage() {
  const currentUserId = useAuthStore((s) => s.userId);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LearningMaterial | null>(null);

  const supabase = useMemo(() => createClient(), []);

  /* ─────── Fetch ALL public materials (community library) ─────── */

  const fetchMaterials = useCallback(async () => {
    const { data, error } = await supabase
      .from("learning_materials")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const materials = data as unknown as LearningMaterial[];
      const userIds = [...new Set(materials.map((material) => material.user_id))];
      const { data: profiles } = userIds.length
        ? await supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .in("id", userIds)
        : { data: null };

      const profilesById = new Map(
        ((profiles as ProfilePreview[] | null) ?? []).map((profile) => [
          profile.id,
          {
            username: profile.username,
            avatar_url: profile.avatar_url,
          },
        ])
      );

      setMaterials(
        materials.map((material) => ({
          ...material,
          profiles: profilesById.get(material.user_id) ?? null,
        }))
      );
    } else if (error) {
      console.error("Error fetching learning materials:", error);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchMaterials();
  }, [fetchMaterials]);

  const handleDeleteMaterial = useCallback(async (material: LearningMaterial) => {
    if (!currentUserId || currentUserId !== material.user_id) {
      setDeleteTarget(null);
      return;
    }

    const { error } = await supabase
      .from("learning_materials")
      .delete()
      .eq("id", material.id)
      .eq("user_id", currentUserId);

    if (!error) {
      if (material.file_path) {
        const storagePath = storagePathFromPublicUrl(material.file_path);
        if (storagePath) {
          await supabase.storage.from("learning-materials").remove([storagePath]);
        }
      }
      setMaterials((prev) => prev.filter((m) => m.id !== material.id));
    } else {
      console.error("Error deleting learning material:", error);
    }
    setDeleteTarget(null);
  }, [currentUserId, supabase]);

  /* ─────── Real-time updates ─────── */

  useEffect(() => {
    const channel = supabase
      .channel("materials-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "learning_materials" }, () => {
        fetchMaterials();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, fetchMaterials]);

  /* ─────── Filtering ─────── */

  const filteredMaterials = useMemo(() => {
    let result = materials;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q) ||
          m.url?.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (activeTags.size > 0) {
      result = result.filter((m) => m.tags.some((t) => activeTags.has(`#${t}`)));
    }
    return result;
  }, [materials, searchQuery, activeTags]);

  const toggleTag = useCallback((tag: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }, []);

  const handleCardTagClick = useCallback((tag: string) => {
    setActiveTags((prev) => { const next = new Set(prev); next.add(tag); return next; });
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setActiveTags(new Set());
  }, []);

  const hasActiveFilters = searchQuery.trim() !== "" || activeTags.size > 0;

  /* ─────── Derived: all tags in use ─────── */

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    materials.forEach((m) => m.tags.forEach((t) => tagSet.add(`#${t}`)));
    return [...PRESET_TAGS.filter((t) => tagSet.has(t)), ...PRESET_TAGS.filter((t) => !tagSet.has(t))];
  }, [materials]);

  return (
    <>
      <AddMaterialModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onCreated={fetchMaterials} />

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-[#2A211C]/30 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }} onClick={() => setDeleteTarget(null)}
            />
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative w-full max-w-[400px] rounded-[28px] border border-[rgba(210,190,170,0.18)] shadow-[0_40px_100px_rgba(42,33,28,0.2)]"
                style={{ background: "linear-gradient(160deg, rgba(250,246,240,0.97), rgba(243,238,230,0.98))", backdropFilter: "blur(24px)" }}
              >
                <div className="relative z-10 p-7 text-center">
                  <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#b75542]/10 ring-1 ring-[#b75542]/15">
                    <AlertTriangle className="size-6 text-[#b75542]" strokeWidth={1.6} />
                  </div>
                  <h2 className="font-serif text-xl font-semibold tracking-tight text-[#2A211C]">Are you sure you want to delete this?</h2>
                  <p className="mx-auto mt-2 max-w-[300px] text-sm leading-relaxed text-[#8d8175]">
                    <span className="font-medium text-[#2A211C]">{deleteTarget.title}</span> will be removed from the community library. This action cannot be undone.
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-3">
                    <button onClick={() => setDeleteTarget(null)}
                      className="rounded-[14px] border border-[rgba(210,190,170,0.22)] bg-white/55 px-5 py-2.5 text-sm font-medium text-[#6B5D52] transition-colors hover:bg-white hover:text-[#2A211C]"
                    >Cancel</button>
                    <button onClick={() => handleDeleteMaterial(deleteTarget)}
                      className="inline-flex items-center gap-2 rounded-[14px] bg-[#b75542] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(183,85,66,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#a54838]"
                    >
                      <Trash2 className="size-4" strokeWidth={1.8} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ───────── Hero ───────── */}
      <LearnHero materialCount={materials.length} />

      {/* ───────── Search Bar ───────── */}
      <div className="mb-5">
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 rounded-[20px] bg-gradient-to-br from-[rgba(255,255,255,0.3)] to-[rgba(255,255,255,0.05)] blur-sm" />
          <div
            className="relative flex items-center rounded-[20px] border border-[rgba(210,190,170,0.14)] transition-all duration-300 focus-within:border-[#D88A5B]/20 focus-within:shadow-[0_0_0_4px_rgba(216,138,91,0.06)]"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.55), rgba(250,246,240,0.3))",
              boxShadow: "0 4px 20px rgba(42,33,28,0.03), 0 0 0 1px rgba(255,255,255,0.5) inset",
              backdropFilter: "blur(12px)",
            }}
          >
            <Search className="ml-5 size-4 shrink-0 text-[#8d8175]/40" strokeWidth={1.8} />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search community materials…"
              className="h-[54px] w-full border-0 bg-transparent px-4 text-sm text-[#2A211C] placeholder:text-[#8d8175]/40 focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}
                className="mr-3 flex size-7 items-center justify-center rounded-full text-[#8d8175]/40 transition-colors hover:bg-[rgba(210,190,170,0.12)] hover:text-[#2A211C]"
              >
                <X className="size-3.5" strokeWidth={1.8} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ───────── Trending Tags ───────── */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {allTags.slice(0, 12).map((tag) => {
          const isActive = activeTags.has(tag);
          return (
            <button key={tag} onClick={() => toggleTag(tag)}
              className={`rounded-full px-4 py-1.5 text-[12px] font-medium transition-all duration-200 ease-out ${
                isActive
                  ? "bg-[#D88A5B] text-white shadow-[0_4px_16px_rgba(216,138,91,0.25)]"
                  : "bg-[rgba(210,190,170,0.1)] text-[#8d8175] hover:bg-[rgba(210,190,170,0.18)] hover:text-[#2A211C]"
              }`}
            >{tag}</button>
          );
        })}
        {hasActiveFilters && (
          <button onClick={clearFilters}
            className="ml-1 rounded-full px-3.5 py-1.5 text-[12px] font-medium text-[#D88A5B] transition-all duration-200 hover:bg-[rgba(216,138,91,0.08)]"
          >Clear all</button>
        )}
      </div>

      {/* ───────── Grid Header ───────── */}
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-[#8d8175]">
          {filteredMaterials.length === 0
            ? hasActiveFilters ? "No results" : "No resources yet"
            : `${filteredMaterials.length} resource${filteredMaterials.length !== 1 ? "s" : ""}`}
        </p>

        <button onClick={() => setIsAddModalOpen(true)}
          className="group flex items-center gap-2 rounded-[14px] bg-[#2A211C] px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:bg-[#3D322B] hover:shadow-[0_12px_32px_rgba(42,33,28,0.15)] hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <Plus className="size-4" strokeWidth={2} />
          Share Resource
        </button>
      </div>

      {/* ───────── Materials Grid ───────── */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-[24px] border border-[rgba(210,190,170,0.08)] bg-[rgba(255,255,255,0.2)] p-5">
              <div className="mb-3 h-4 w-24 animate-pulse rounded-full bg-[rgba(210,190,170,0.12)]" />
              <div className="mb-2 h-5 w-3/4 animate-pulse rounded-md bg-[rgba(210,190,170,0.1)]" />
              <div className="mb-4 h-4 w-full animate-pulse rounded-md bg-[rgba(210,190,170,0.06)]" />
            </div>
          ))}
        </div>
      ) : filteredMaterials.length === 0 ? (
        <EmptyState hasFilters={hasActiveFilters} />
      ) : (
        <motion.div layout className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredMaterials.map((material) => (
              <MaterialCard
                key={material.id}
                material={material}
                currentUserId={currentUserId}
                onTagClick={handleCardTagClick}
                onDelete={setDeleteTarget}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </>
  );
}

"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

/* ──────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────── */

export interface LuxurySelectOption<T = string> {
  value: T;
  label: string;
  icon?: ReactNode;
  subtitle?: string;
  disabled?: boolean;
}

interface LuxurySelectBaseProps<T = string> {
  options: LuxurySelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  itemClassName?: string;
  disabled?: boolean;
  above?: boolean;
}

/* ──────────────────────────────────────────────
   PORTAL CONTAINER — singleton, external store
   ────────────────────────────────────────────── */

let portalContainer: HTMLDivElement | null = null;
const portalListeners = new Set<() => void>();

function subscribeToPortal(cb: () => void) {
  portalListeners.add(cb);
  return () => {
    portalListeners.delete(cb);
  };
}

function getPortalSnapshot() {
  return portalContainer;
}

function getPortalServerSnapshot() {
  return null;
}

function initPortalOnce() {
  if (portalContainer && document.body.contains(portalContainer)) return;
  const existing = document.getElementById("luxury-select-portal");
  if (existing) {
    portalContainer = existing as HTMLDivElement;
    return;
  }
  const el = document.createElement("div");
  el.id = "luxury-select-portal";
  el.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:9999;isolation:isolate";
  document.body.appendChild(el);
  portalContainer = el;
}

function usePortalContainer(): HTMLDivElement | null {
  const container = useSyncExternalStore(
    subscribeToPortal,
    getPortalSnapshot,
    getPortalServerSnapshot
  );

  useEffect(() => {
    initPortalOnce();
    portalListeners.forEach((fn) => fn());
  }, []);

  return container;
}

/* ──────────────────────────────────────────────
   PREMIUM DROPDOWN ANIMATION VARIANTS
   ────────────────────────────────────────────── */

const springEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const dropdownVariants = {
  hidden: { opacity: 0, y: -6, scaleY: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scaleY: 1,
    transition: { duration: 0.18, ease: springEase },
  },
  exit: {
    opacity: 0,
    y: -4,
    scaleY: 0.96,
    transition: { duration: 0.12, ease: springEase },
  },
};

const dropdownAboveVariants = {
  hidden: { opacity: 0, y: 6, scaleY: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scaleY: 1,
    transition: { duration: 0.18, ease: springEase },
  },
  exit: {
    opacity: 0,
    y: 4,
    scaleY: 0.96,
    transition: { duration: 0.12, ease: springEase },
  },
};

/* ──────────────────────────────────────────────
   MENU CONTENT (shared between variants)
   ────────────────────────────────────────────── */

interface MenuContentProps<T> {
  options: LuxurySelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  onClose: () => void;
  itemClassName?: string;
}

function MenuContent<T>({
  options,
  value,
  onChange,
  onClose,
  itemClassName,
}: MenuContentProps<T>) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.012] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='mn'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23mn)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="pointer-events-none absolute -top-8 left-1/4 size-32 rounded-full bg-[#D88A5B]/8 blur-2xl" />

      <div className="relative z-10 px-1.5 py-2 max-h-[280px] overflow-y-auto overscroll-contain">
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => {
                onChange(option.value);
                onClose();
              }}
              disabled={option.disabled}
              role="option"
              aria-selected={isSelected}
              className={cn(
                "flex w-full items-center gap-3 rounded-[12px] px-3.5 text-left text-[13px] font-medium transition-all duration-150",
                "h-[44px]",
                isSelected
                  ? "bg-gradient-to-r from-[#D88A5B]/10 to-[#C9A96E]/6 text-[#2A1E17] shadow-[0_0_0_1px_rgba(216,138,91,0.12)]"
                  : "text-[#5A4A3E]/85 hover:bg-[rgba(248,241,234,0.80)] hover:text-[#2A1E17] hover:shadow-[0_0_0_1px_rgba(210,190,170,0.10)]",
                option.disabled && "cursor-not-allowed opacity-40",
                itemClassName
              )}
            >
              {option.icon && <span className="shrink-0">{option.icon}</span>}
              <span className="flex-1 truncate">{option.label}</span>
              {option.subtitle && (
                <span className="shrink-0 text-[11px] text-[#8d8175]/40">
                  {option.subtitle}
                </span>
              )}
              {isSelected && (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#D88A5B]/12">
                  <span className="size-1.5 rounded-full bg-[#D88A5B]" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ──────────────────────────────────────────────
   SMART POSITIONING
   ────────────────────────────────────────────── */

function useMenuPosition(
  open: boolean,
  triggerRef: React.RefObject<HTMLElement | null>,
  itemCount: number,
  above: boolean
) {
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = Math.max(rect.width, 200);
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const estimatedHeight = Math.min(itemCount * 48 + 16, 320);

      if (above || (spaceAbove > spaceBelow && spaceBelow < estimatedHeight)) {
        setMenuStyle({
          position: "fixed" as const,
          bottom: window.innerHeight - rect.top + 6,
          left: rect.left,
          width: menuWidth,
        });
      } else {
        setMenuStyle({
          position: "fixed" as const,
          top: rect.bottom + 6,
          left: rect.left,
          width: menuWidth,
        });
      }
    }
  }, [open, triggerRef, itemCount, above]);

  return menuStyle;
}

/* ──────────────────────────────────────────────
   LUXURY SELECT — STANDARD
   ────────────────────────────────────────────── */

export function LuxurySelect<T = string>({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className,
  triggerClassName,
  menuClassName,
  itemClassName,
  disabled = false,
  above = false,
}: LuxurySelectBaseProps<T>) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const portalContainer = usePortalContainer();
  const menuStyle = useMenuPosition(open, triggerRef, options.length, above);

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  );

  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as Node;
    if (
      triggerRef.current &&
      !triggerRef.current.contains(target) &&
      menuRef.current &&
      !menuRef.current.contains(target)
    ) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, handleClickOutside]);

  useEffect(() => {
    if (!open) return;
    const handleScroll = () => setOpen(false);
    document.addEventListener("scroll", handleScroll, { passive: true });
    return () => document.removeEventListener("scroll", handleScroll);
  }, [open]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          if (!disabled) setOpen((prev) => !prev);
          break;
        case "Escape":
          setOpen(false);
          triggerRef.current?.focus();
          break;
        case "Tab":
          setOpen(false);
          break;
      }
    },
    [disabled]
  );

  const handleClose = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => !disabled && setOpen((prev) => !prev)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onKeyDown={handleKeyDown}
      aria-haspopup="listbox"
      aria-expanded={open}
      disabled={disabled}
      className={cn(
        "group relative flex w-full items-center gap-2 rounded-[14px] border bg-white/60 px-4 py-[13px] text-left text-[14px] font-medium text-[#1F1610] transition-all duration-200",
        "placeholder:text-[#9A8A7C]/60",
        focused && !open
          ? "border-[#D88A5B]/40 ring-[3px] ring-[#D88A5B]/10"
          : "border-[rgba(180,165,148,0.25)]",
        open && "rounded-b-none border-[#D88A5B]/30",
        disabled && "cursor-not-allowed opacity-50",
        triggerClassName
      )}
    >
      <span className="flex-1 truncate">
        {selected ? (
          <span className="flex items-center gap-2.5">
            {selected.icon && <span className="shrink-0">{selected.icon}</span>}
            <span>{selected.label}</span>
            {selected.subtitle && (
              <span className="text-[12px] text-[#8d8175]/50">{selected.subtitle}</span>
            )}
          </span>
        ) : (
          <span className="text-[#9A8A7C]/60">{placeholder}</span>
        )}
      </span>

      <span className="flex size-6 shrink-0 items-center justify-center rounded-[8px] text-[#8d8175]/45 transition-colors">
        <ChevronDown
          className={cn("size-[15px] transition-all duration-200", open && "rotate-180")}
          strokeWidth={1.8}
        />
      </span>

      <span
        className="pointer-events-none absolute inset-0 rounded-[14px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          boxShadow: "inset 0 0 0 1px rgba(216,138,91,0.08)",
          background: "radial-gradient(ellipse at 50% 0%, rgba(216,138,91,0.03) 0%, transparent 70%)",
        }}
      />
    </button>
  );

  const menu = open && (
    <AnimatePresence>
      <motion.div
        key="luxury-menu"
        ref={menuRef}
        variants={above ? dropdownAboveVariants : dropdownVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        role="listbox"
        style={{ ...menuStyle, pointerEvents: "auto" }}
        className={cn(
          "z-[9999] origin-top overflow-hidden rounded-[14px] border backdrop-blur-xl",
          "border-[#D88A5B]/20 bg-white/99 shadow-[0_20px_60px_rgba(42,33,28,0.18),0_4px_16px_rgba(42,33,28,0.06),0_0_0_1px_rgba(255,255,255,0.5)_inset]",
          menuClassName
        )}
      >
        <MenuContent
          options={options}
          value={value}
          onChange={onChange}
          onClose={handleClose}
          itemClassName={itemClassName}
        />
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className={cn("relative", className)}>
      {trigger}
      {portalContainer && createPortal(menu, portalContainer)}
    </div>
  );
}

/* ──────────────────────────────────────────────
   LUXURY SEARCHABLE SELECT
   ────────────────────────────────────────────── */

export function LuxurySearchableSelect<T = string>({
  options: rawOptions = [],
  value,
  onChange,
  placeholder = "Search or type...",
  className,
  triggerClassName,
  menuClassName,
  itemClassName,
  disabled = false,
  above = false,
  onSubmit,
  suggestions,
}: Omit<LuxurySelectBaseProps<T>, "options"> & {
  options?: LuxurySelectOption<T>[];
  onSubmit?: () => void;
  suggestions?: string[];
}) {
  // If suggestions is provided as string[], convert to options
  const options = useMemo(() => {
    if (suggestions) {
      return suggestions.map((s) => ({ value: s as unknown as T, label: s } as LuxurySelectOption<T>));
    }
    return rawOptions;
  }, [suggestions, rawOptions]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const portalContainer = usePortalContainer();
  const filtered = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase())),
    [options, search]
  );
  const menuStyle = useMenuPosition(open, containerRef, filtered.length, above);

  // Keep search in sync with value when closed
  const prevOpen = useRef(false);
  useEffect(() => {
    if (prevOpen.current && !open) {
      const label = options.find((o) => o.value === value)?.label ?? "";
      setSearch(label);
    }
    prevOpen.current = open;
  }, [open, value, options]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as Node;
    if (
      containerRef.current &&
      !containerRef.current.contains(target) &&
      menuRef.current &&
      !menuRef.current.contains(target)
    ) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, handleClickOutside]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      if (!open) setOpen(true);
    },
    [open]
  );

  const handleSelect = useCallback(
    (optionValue: T) => {
      onChange(optionValue);
      const label = options.find((o) => o.value === optionValue)?.label ?? "";
      setSearch(label);
      setOpen(false);
      inputRef.current?.blur();
    },
    [onChange, options]
  );

  const handleClear = useCallback(() => {
    setSearch("");
    if (!open) setOpen(true);
    inputRef.current?.focus();
  }, [open]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div
        className={cn(
          "group relative flex items-center rounded-[14px] border bg-white/60 transition-all duration-200",
          focused && !open
            ? "border-[#D88A5B]/40 ring-[3px] ring-[#D88A5B]/10"
            : "border-[rgba(180,165,148,0.25)]",
          open && "rounded-b-none border-[#D88A5B]/30",
          disabled && "pointer-events-none opacity-50",
          triggerClassName
        )}
      >
        <span className="pointer-events-none absolute left-4 text-[#9A8A7C]/40">
          <Search className="size-[15px]" strokeWidth={1.8} />
        </span>

        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={handleInputChange}
          onFocus={() => {
            setFocused(true);
            if (!open) setOpen(true);
          }}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              inputRef.current?.blur();
            }
            if (e.key === "Enter" && filtered.length === 1) {
              handleSelect(filtered[0].value);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-[14px] bg-transparent px-4 py-[13px] pl-[38px] pr-10 text-[14px] font-medium text-[#1F1610] placeholder:text-[#9A8A7C]/60 outline-none transition-all"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {search && (
            <button
              type="button"
              onClick={handleClear}
              className="flex size-5 items-center justify-center rounded-[6px] text-[#8d8175]/40 transition-colors hover:bg-[rgba(216,138,91,0.10)] hover:text-[#D88A5B]"
            >
              <X className="size-3.5" strokeWidth={1.8} />
            </button>
          )}
          <button
            type="button"
            onClick={() => !disabled && setOpen((prev) => !prev)}
            className="flex size-6 items-center justify-center rounded-[8px] text-[#8d8175]/45 transition-colors"
          >
            <ChevronDown
              className={cn("size-[15px] transition-all duration-200", open && "rotate-180")}
              strokeWidth={1.8}
            />
          </button>
        </div>

        <span
          className="pointer-events-none absolute inset-0 rounded-[14px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            boxShadow: "inset 0 0 0 1px rgba(216,138,91,0.08)",
            background: "radial-gradient(ellipse at 50% 0%, rgba(216,138,91,0.03) 0%, transparent 70%)",
          }}
        />
      </div>

      {open &&
        portalContainer &&
        createPortal(
          <AnimatePresence>
            <motion.div
              key="luxury-search-menu"
              ref={menuRef}
              variants={above ? dropdownAboveVariants : dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="listbox"
              style={{ ...menuStyle, pointerEvents: "auto" }}
              className={cn(
                "z-[9999] origin-top overflow-hidden rounded-[14px] border backdrop-blur-xl",
                "border-[#D88A5B]/20 bg-white/99 shadow-[0_20px_60px_rgba(42,33,28,0.18),0_4px_16px_rgba(42,33,28,0.06),0_0_0_1px_rgba(255,255,255,0.5)_inset]",
                menuClassName
              )}
            >
              {filtered.length > 0 ? (
                <MenuContent
                  options={filtered}
                  value={value}
                  onChange={handleSelect}
                  onClose={handleClose}
                  itemClassName={itemClassName}
                />
              ) : (
                <>
                  <div className="pointer-events-none absolute inset-0 opacity-[0.012] mix-blend-multiply" />
                  <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                    <Search className="size-6 text-[#8d8175]/25" strokeWidth={1.2} />
                    <p className="text-[13px] text-[#8d8175]/50">No results found</p>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>,
          portalContainer
        )}
    </div>
  );
}

// Shared UI building blocks for Tournex — premium dark.
// All styled with the design tokens + surface treatments in globals.css.
"use client";

import { useState, type ReactNode, type InputHTMLAttributes } from "react";

// ── Button ───────────────────────────────────────────────────

type ButtonVariant = "lime" | "outline" | "danger" | "ghost";
type ButtonSize = "md" | "sm";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-soft font-semibold cursor-pointer " +
  "transition-all duration-200 ease-out disabled:opacity-40 disabled:pointer-events-none " +
  "active:scale-[0.98]";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  lime:
    "bg-gradient-to-b from-lime2 to-lime text-bg shadow-[0_2px_12px_-2px_rgba(173,255,47,0.4)] " +
    "hover:shadow-[0_4px_24px_-2px_rgba(173,255,47,0.55)] hover:-translate-y-0.5",
  outline:
    "border border-br2 bg-bg2/60 text-tx hover:border-tx3 hover:bg-bg3",
  danger:
    "border border-red/25 bg-red/10 text-red hover:bg-red/15 hover:border-red/40",
  ghost: "text-tx2 hover:text-tx hover:bg-bg3",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  md: "px-5 py-3 text-sm",
  sm: "px-3.5 py-2 text-xs",
};

export function Button({
  variant = "lime",
  size = "md",
  full = false,
  className = "",
  children,
  ...props
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  className?: string;
  children: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${full ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// ── Inputs ───────────────────────────────────────────────────

const FIELD_CLASS =
  "w-full rounded-soft border border-br2 bg-bg/60 px-3.5 py-2.5 text-sm text-tx " +
  "outline-none transition-all duration-200 placeholder:text-tx3 " +
  "hover:border-tx3/60 focus:border-lime focus:bg-bg " +
  "focus:shadow-[0_0_0_3px_rgba(173,255,47,0.12)]";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={FIELD_CLASS} {...props} />;
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return <textarea className={FIELD_CLASS} rows={3} {...props} />;
}

export function Select({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${FIELD_CLASS} cursor-pointer`} {...props}>
      {children}
    </select>
  );
}

// ── Label + tooltip ──────────────────────────────────────────

export function Tooltip({ text }: { text: string }) {
  return (
    <span
      title={text}
      className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-br2 text-[10px] font-bold text-tx3 transition-colors hover:bg-lime/20 hover:text-lime"
    >
      ?
    </span>
  );
}

export function Label({
  children,
  tip,
}: {
  children: ReactNode;
  tip?: string;
}) {
  return (
    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-tx2">
      {children}
      {tip && <Tooltip text={tip} />}
    </label>
  );
}

export function Field({
  label,
  tip,
  hint,
  children,
}: {
  label?: string;
  tip?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-4">
      {label && <Label tip={tip}>{label}</Label>}
      {children}
      {hint && <p className="mt-1 text-[11px] text-tx3">{hint}</p>}
    </div>
  );
}

// ── Card ─────────────────────────────────────────────────────

export function Card({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`surface rounded-card ${onClick ? "surface-hover cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

// ── Badge ────────────────────────────────────────────────────

const STATUS_CLASS: Record<string, string> = {
  draft: "status-draft",
  open: "status-open",
  live: "status-live",
  done: "status-done",
};

export function StatusBadge({
  status,
  label,
}: {
  status: string;
  label: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${STATUS_CLASS[status] ?? ""}`}
    >
      {status === "live" && (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {label}
    </span>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-lime/10 px-2 py-0.5 font-mono text-[11px] text-lime ring-1 ring-inset ring-lime/15">
      {children}
    </span>
  );
}

// ── Toggle ───────────────────────────────────────────────────

export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-[24px] w-[44px] flex-shrink-0 rounded-full transition-colors duration-200 ${
        checked
          ? "bg-lime shadow-[0_0_12px_-1px_rgba(173,255,47,0.5)]"
          : "bg-br2"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-[20px] w-[20px] rounded-full bg-white shadow-sm transition-transform duration-200 ease-out ${
          checked ? "translate-x-[20px]" : ""
        }`}
      />
    </button>
  );
}

export function ToggleRow({
  label,
  sub,
  checked,
  onChange,
}: {
  label: string;
  sub?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-hair py-3 last:border-0">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {sub && <div className="mt-0.5 text-xs text-tx3">{sub}</div>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

// ── Chips (single + multi select pills) ──────────────────────

export function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95 ${
        selected
          ? "border-lime/50 bg-lime/12 text-lime shadow-[0_0_16px_-4px_rgba(173,255,47,0.4)]"
          : "border-br2 bg-bg2/60 text-tx2 hover:border-tx3 hover:text-tx"
      }`}
    >
      {children}
    </button>
  );
}

/** Controlled single-select chip group. */
export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip
          key={o.value}
          selected={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </Chip>
      ))}
    </div>
  );
}

/** Controlled multi-select chip group. */
export function ChipMulti({
  options,
  values,
  onChange,
}: {
  options: string[];
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) => {
    onChange(
      values.includes(opt)
        ? values.filter((v) => v !== opt)
        : [...values, opt],
    );
  };
  return (
    <div className="mt-1.5 flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip key={o} selected={values.includes(o)} onClick={() => toggle(o)}>
          {o}
        </Chip>
      ))}
    </div>
  );
}

// ── Misc ─────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: string;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-5 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-bg3 text-3xl ring-1 ring-hair">
        {icon}
      </div>
      <h3 className="mb-1.5 text-base font-bold text-tx">{title}</h3>
      {body && <p className="mb-5 max-w-sm text-sm text-tx3">{body}</p>}
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: ReactNode;
  accent?: string;
}) {
  return (
    <div className="surface relative overflow-hidden rounded-card p-5">
      <div
        className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-20 blur-2xl"
        style={{ background: accent ?? "var(--color-lime)" }}
      />
      <div className="relative">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-tx3">
          {label}
        </div>
        <div
          className="font-mono text-[32px] font-bold leading-none tracking-tight"
          style={{ color: accent ?? "var(--color-lime)" }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

export function ProgressBar({ pct }: { pct: number }) {
  const clamped = Math.min(100, Math.max(0, pct));
  return (
    <div className="h-2 overflow-hidden rounded-full bg-bg3 ring-1 ring-inset ring-hair">
      <div
        className="h-full rounded-full bg-gradient-to-r from-limedim to-lime transition-all duration-500 ease-out"
        style={{
          width: `${clamped}%`,
          boxShadow: clamped > 0 ? "0 0 12px -1px rgba(173,255,47,0.6)" : "none",
        }}
      />
    </div>
  );
}

export function Avatar({ initials }: { initials: string }) {
  return (
    <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lime/15 to-lime/5 font-mono text-[11px] font-bold text-lime ring-1 ring-inset ring-lime/20">
      {initials}
    </span>
  );
}

/** Small helper for inline copy-to-clipboard fields. */
export function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="my-2 flex items-center gap-2 rounded-soft border border-br2 bg-bg/60 px-3.5 py-2.5">
      <input
        readOnly
        value={value}
        className="flex-1 bg-transparent font-mono text-[13px] text-tx2 outline-none"
      />
      <Button
        size="sm"
        variant={copied ? "outline" : "lime"}
        onClick={() => {
          navigator.clipboard?.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? "✓ Copiado" : "Copiar"}
      </Button>
    </div>
  );
}

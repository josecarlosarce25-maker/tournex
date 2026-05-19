// Small pure helpers shared across the app.

/** Generates a short, collision-resistant id. */
export function genId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).substring(2, 7)
  );
}

/** Builds a URL-safe slug from a tournament name plus a short random suffix. */
export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 40);
  const suffix = Math.random().toString(36).substring(2, 7);
  return base ? `${base}-${suffix}` : suffix;
}

/** "Juan Pérez" + "María Gómez" -> "J. Pérez / M. Gómez". */
export function formatPairName(p1: string, p2?: string): string {
  const abbreviate = (n: string) => {
    const parts = n.trim().split(/\s+/);
    return parts.length > 1
      ? `${parts[0][0]}. ${parts.slice(1).join(" ")}`
      : n.trim();
  };
  if (!p2) return abbreviate(p1);
  return `${abbreviate(p1)} / ${abbreviate(p2)}`;
}

/** Initials for an avatar chip, e.g. "J. Pérez / M. Gómez" -> "JP MG". */
export function initials(name: string): string {
  return name
    .split("/")
    .map((part) =>
      part
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase(),
    )
    .join(" ");
}

export function isPadel(sport?: string): boolean {
  const s = (sport ?? "").toLowerCase();
  return s.includes("pádel") || s.includes("padel");
}

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export const FORMAT_LABELS: Record<string, string> = {
  round_robin: "Americano",
  elimination: "Eliminación directa",
  groups_elim: "Grupos + Eliminación",
  liga_semanal: "Liga (semanal)",
};

export const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  open: "Inscripciones",
  live: "En vivo",
  done: "Terminado",
};

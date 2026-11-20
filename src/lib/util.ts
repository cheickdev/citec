// Petites fonctions communes. Fuseau de l'entreprise : Bamako (UTC+0).
export const TZ = "Africa/Bamako";

/** 125000 -> « 125 000 F CFA » */
export function fcfa(n: number): string {
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(n))} F CFA`;
}
/** « 125 000 », « 125000 », « 125.000 » -> 125000 */
export function parseAmount(s: unknown): number {
  const n = parseInt(String(s ?? "").replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}
export function today(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
export const thisMonth = () => today().slice(0, 7);
export function dayLabel(d: string): string {
  if (!d) return "";
  return new Date(`${d}T12:00:00Z`).toLocaleDateString("fr-FR", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" });
}
export function monthLabel(m: string): string {
  return new Date(`${m}-15T12:00:00Z`).toLocaleDateString("fr-FR", { timeZone: "UTC", month: "long", year: "numeric" });
}
export function timeLabel(d: Date | null | undefined): string {
  return d ? d.toLocaleTimeString("fr-FR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }) : "—";
}
export function dateTimeLabel(d: Date): string {
  return d.toLocaleString("fr-FR", { timeZone: TZ, dateStyle: "short", timeStyle: "short" });
}
export function addMonths(m: string, n: number): string {
  const d = new Date(`${m}-15T12:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().slice(0, 7);
}
export const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");

export const STATUS: Record<string, { label: string; cls: string }> = {
  TODO: { label: "À faire", cls: "" },
  DOING: { label: "En cours", cls: "blue" },
  DONE: { label: "Fait", cls: "ok" },
};
export const PRIORITY: Record<string, { label: string; cls: string }> = {
  LOW: { label: "Basse", cls: "" },
  NORMAL: { label: "Normale", cls: "" },
  HIGH: { label: "Urgente", cls: "danger" },
};

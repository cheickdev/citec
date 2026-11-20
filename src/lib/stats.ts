// Chiffres en direct : chaque projet expose /api/citec/stats, protege par sa cle secrete.
// Reponse attendue :
// { ok: true, kpis: [{ label, value, format: "money" | "count" | "text", hint? }],
//   revenue: [{ month: "AAAA-MM", amount }] }   (montants en F CFA)
// Les recettes mensuelles sont recopiees dans les finances (source AUTO).
import { prisma } from "@/lib/db";
import { today } from "@/lib/util";

export interface Kpi { label: string; value: number | string; format?: "money" | "count" | "text"; hint?: string }
export interface Stats { kpis: Kpi[]; revenue?: { month: string; amount: number }[] }
export interface ProjectStats { stats: Stats | null; at: Date | null; error: string | null }

const FRESH_MS = 10 * 60_000;

type P = { id: string; slug: string; name: string; kind: string; statsUrl: string; statsKey: string };

export async function projectStats(p: P, force = false): Promise<ProjectStats> {
  if (p.kind === "other" || !p.statsUrl) return { stats: null, at: null, error: null };
  const last = await prisma.statSnapshot.findFirst({ where: { projectId: p.id }, orderBy: { createdAt: "desc" } });
  if (!force && last && Date.now() - last.createdAt.getTime() < FRESH_MS) return { stats: last.data as unknown as Stats, at: last.createdAt, error: null };
  try {
    const r = await fetch(p.statsUrl, { headers: { Authorization: `Bearer ${p.statsKey}` }, cache: "no-store", signal: AbortSignal.timeout(7000) });
    const j = await r.json().catch(() => null);
    if (!r.ok || !j?.ok || !Array.isArray(j.kpis)) throw new Error(r.status === 401 ? "clé refusée" : `réponse ${r.status}`);
    const stats: Stats = { kpis: j.kpis.slice(0, 12), revenue: Array.isArray(j.revenue) ? j.revenue.slice(0, 24) : [] };
    await prisma.statSnapshot.create({ data: { projectId: p.id, data: stats as object } });
    await prisma.statSnapshot.deleteMany({ where: { projectId: p.id, createdAt: { lt: new Date(Date.now() - 7 * 86400_000) } } });
    // Recettes du projet -> finances (une ligne par mois, mise a jour)
    for (const r of stats.revenue ?? []) {
      if (!/^\d{4}-\d{2}$/.test(r.month) || typeof r.amount !== "number") continue;
      const autoKey = `auto:${p.slug}:${r.month}`;
      const day = r.month === today().slice(0, 7) ? today() : `${r.month}-28`;
      await prisma.finEntry.upsert({
        where: { autoKey },
        create: { autoKey, projectId: p.id, kind: "INCOME", amount: Math.round(r.amount), category: "Ventes", label: `Recettes ${p.name} (automatique)`, day, source: "AUTO" },
        update: { amount: Math.round(r.amount), day },
      });
    }
    return { stats, at: new Date(), error: null };
  } catch (e) {
    return { stats: last ? (last.data as unknown as Stats) : null, at: last?.createdAt ?? null, error: (e as Error).message || "injoignable" };
  }
}

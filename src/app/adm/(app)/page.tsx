import { prisma } from "@/lib/db";
import { ensureProjects } from "@/lib/projects";
import { projectStats, type Kpi } from "@/lib/stats";
import { dateTimeLabel, fcfa, monthLabel, thisMonth, today } from "@/lib/util";
import TaskRow from "@/components/TaskRow";

export const metadata = { title: "Tableau de bord" };

const show = (k: Kpi) => (k.format === "money" && typeof k.value === "number" ? fcfa(k.value) : typeof k.value === "number" ? new Intl.NumberFormat("fr-FR").format(k.value) : k.value);

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ maj?: string }> }) {
  await ensureProjects();
  const { maj } = await searchParams;
  const month = thisMonth();
  const projects = await prisma.project.findMany({ where: { active: true }, orderBy: [{ order: "asc" }, { name: "asc" }], include: { _count: { select: { tasks: { where: { status: { not: "DONE" } } }, members: true } } } });
  const stats = await Promise.all(projects.map((p) => projectStats(p, maj === "1")));
  const [members, open, late, present, fin, urgent] = await Promise.all([
    prisma.member.count({ where: { active: true } }),
    prisma.task.count({ where: { status: { not: "DONE" } } }),
    prisma.task.count({ where: { status: { not: "DONE" }, dueDate: { lt: today(), not: "" } } }),
    prisma.attendance.count({ where: { day: today() } }),
    prisma.finEntry.groupBy({ by: ["kind"], where: { day: { startsWith: month } }, _sum: { amount: true } }),
    prisma.task.findMany({ where: { status: { not: "DONE" }, OR: [{ priority: "HIGH" }, { dueDate: { lt: today(), not: "" } }] }, take: 8, orderBy: { createdAt: "desc" }, include: { project: { select: { name: true, color: true } }, assignee: { select: { name: true } } } }),
  ]);
  const income = fin.find((x) => x.kind === "INCOME")?._sum.amount ?? 0;
  const expense = fin.find((x) => x.kind === "EXPENSE")?._sum.amount ?? 0;
  return (
    <>
      <div className="head"><h1>Tableau de bord</h1><a className="btn ghost sm" href="/?maj=1">🔄 Actualiser les chiffres</a></div>
      <div className="tiles">
        <div className="tile"><div className="label">Recettes · {monthLabel(month)}</div><div className="value num" style={{ color: "var(--ok)" }}>{fcfa(income)}</div></div>
        <div className="tile"><div className="label">Dépenses · {monthLabel(month)}</div><div className="value num" style={{ color: "var(--danger)" }}>{fcfa(expense)}</div></div>
        <div className="tile"><div className="label">Résultat du mois</div><div className="value num">{fcfa(income - expense)}</div></div>
        <div className="tile"><div className="label">Tâches ouvertes</div><div className="value">{open}</div><div className="small" style={{ color: late ? "var(--danger)" : "var(--muted)" }}>{late} en retard</div></div>
        <div className="tile"><div className="label">Membres</div><div className="value">{members}</div><div className="muted small">{present} présent(s) aujourd&apos;hui</div></div>
      </div>
      <h2>Projets</h2>
      <div className="grid c3" style={{ marginBottom: 20 }}>
        {projects.map((p, i) => {
          const s = stats[i];
          return (
            <div key={p.id} className="card proj" style={{ ["--c" as string]: p.color }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
                <h2 style={{ margin: 0 }}>{p.name}</h2>
                {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="small">Ouvrir ↗</a>}
              </div>
              <p className="muted small" style={{ margin: "2px 0 10px" }}>{p._count.tasks} tâche(s) ouverte(s) · {p._count.members} membre(s)</p>
              {s.stats ? (
                <div className="kv">
                  {s.stats.kpis.map((k) => [<span key={k.label}>{k.label}{k.hint && <span className="muted small"> · {k.hint}</span>}</span>, <b key={k.label + "v"}>{show(k)}</b>])}
                </div>
              ) : p.kind === "other" ? (
                <p className="muted small" style={{ margin: 0 }}>Suivi par les tâches (pas de chiffres en direct).</p>
              ) : (
                <p className="muted small" style={{ margin: 0 }}>Chiffres en direct pas encore branchés.</p>
              )}
              {(s.at || (s.error && s.error === "clé refusée")) && (
                <p className="small" style={{ margin: "10px 0 0", color: s.error ? "var(--warn)" : "var(--muted)" }}>
                  {s.error ? `⚠️ Projet injoignable (${s.error})${s.at ? ` · chiffres du ${dateTimeLabel(s.at)}` : ""}` : `Mis à jour le ${dateTimeLabel(s.at!)}`}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="head"><h2 style={{ margin: 0 }}>Urgent ou en retard</h2><a href="/taches" className="small">Toutes les tâches →</a></div>
      <div className="list">
        {urgent.length === 0 && <div className="empty">Rien d&apos;urgent. 👍</div>}
        {urgent.map((t) => <TaskRow key={t.id} t={t} href={`/taches/${t.id}`} />)}
      </div>
    </>
  );
}

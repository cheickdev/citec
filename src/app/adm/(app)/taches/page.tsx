import { prisma } from "@/lib/db";
import { ensureProjects, projectOptions } from "@/lib/projects";
import TaskFields from "@/components/TaskForm";
import TaskRow from "@/components/TaskRow";
import Submit from "@/components/Submit";
import { createTask } from "../../actions";

export const metadata = { title: "Tâches" };

export default async function Tasks({ searchParams }: { searchParams: Promise<{ p?: string; m?: string; s?: string }> }) {
  await ensureProjects();
  const { p = "", m = "", s = "open" } = await searchParams;
  const [projects, members] = await Promise.all([projectOptions(), prisma.member.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } })]);
  const tasks = await prisma.task.findMany({
    where: {
      ...(p ? { projectId: p === "none" ? null : p } : {}),
      ...(m ? { assigneeId: m === "none" ? null : m } : {}),
      ...(s === "open" ? { status: { not: "DONE" } } : s === "all" ? {} : { status: s }),
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 300,
    include: { project: { select: { name: true, color: true } }, assignee: { select: { name: true } }, _count: { select: { comments: true } } },
  });
  // Urgentes d'abord, puis par date limite
  const rank = (t: (typeof tasks)[number]) => (t.status === "DONE" ? 2 : t.priority === "HIGH" ? 0 : 1);
  tasks.sort((a, b) => rank(a) - rank(b) || (a.dueDate || "9999").localeCompare(b.dueDate || "9999"));
  const q = (o: Record<string, string>) => "?" + new URLSearchParams({ p, m, s, ...o }).toString();
  return (
    <>
      <div className="head"><h1>Tâches</h1><span className="muted">{tasks.length} affichée(s)</span></div>
      <details className="card" style={{ marginBottom: 16 }}>
        <summary>➕ Nouvelle tâche</summary>
        <form className="form" action={createTask}>
          <TaskFields projects={projects} members={members} />
          <Submit>Créer la tâche</Submit>
        </form>
      </details>
      <div className="chips">
        {[["open", "En cours et à faire"], ["DONE", "Faites"], ["all", "Toutes"]].map(([k, l]) => <a key={k} href={q({ s: k })} className={`chip ${s === k ? "on" : ""}`}>{l}</a>)}
      </div>
      <div className="chips">
        <a href={q({ p: "" })} className={`chip ${!p ? "on" : ""}`}>Tous les projets</a>
        {projects.map((x) => <a key={x.id} href={q({ p: x.id })} className={`chip ${p === x.id ? "on" : ""}`}>{x.name}</a>)}
        <a href={q({ p: "none" })} className={`chip ${p === "none" ? "on" : ""}`}>Entreprise</a>
      </div>
      <form className="chips" method="get">
        <input type="hidden" name="p" value={p} /><input type="hidden" name="s" value={s} />
        <select name="m" className="input" defaultValue={m} style={{ maxWidth: 260 }}>
          <option value="">Tous les membres</option>
          <option value="none">Personne</option>
          {members.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
        <button className="btn ghost sm">Filtrer</button>
      </form>
      <div className="list">
        {tasks.length === 0 && <div className="empty">Aucune tâche ici.</div>}
        {tasks.map((t) => <TaskRow key={t.id} t={t} href={`/taches/${t.id}`} />)}
      </div>
    </>
  );
}

import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/auth";
import { myProjectIds } from "@/lib/memberScope";
import TaskRow from "@/components/TaskRow";

export const metadata = { title: "Mes tâches" };

export default async function MyTasks({ searchParams }: { searchParams: Promise<{ v?: string }> }) {
  const m = await requireMember();
  const { v = "mine" } = await searchParams;
  const projects = await myProjectIds(m.id);
  const where =
    v === "free" ? { projectId: { in: projects }, assigneeId: null, status: { not: "DONE" } }
    : v === "done" ? { assigneeId: m.id, status: "DONE" }
    : { assigneeId: m.id, status: { not: "DONE" } };
  const tasks = await prisma.task.findMany({ where, orderBy: { createdAt: "desc" }, take: 200, include: { project: { select: { name: true, color: true } }, _count: { select: { comments: true } } } });
  if (v !== "done") tasks.sort((a, b) => (a.priority === "HIGH" ? 0 : 1) - (b.priority === "HIGH" ? 0 : 1) || (a.dueDate || "9999").localeCompare(b.dueDate || "9999"));
  return (
    <>
      <h1>Tâches</h1>
      <div className="chips">
        <a href="?v=mine" className={`chip ${v === "mine" ? "on" : ""}`}>Mes tâches</a>
        <a href="?v=free" className={`chip ${v === "free" ? "on" : ""}`}>Libres dans mes projets</a>
        <a href="?v=done" className={`chip ${v === "done" ? "on" : ""}`}>Faites</a>
      </div>
      <div className="list">
        {tasks.length === 0 && <div className="empty">{v === "free" ? "Aucune tâche libre dans vos projets." : "Aucune tâche ici."}</div>}
        {tasks.map((t) => <TaskRow key={t.id} t={t} href={`/taches/${t.id}`} />)}
      </div>
    </>
  );
}

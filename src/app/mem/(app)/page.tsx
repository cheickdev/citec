import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/auth";
import { myProjectIds, visibleTo } from "@/lib/memberScope";
import { dateTimeLabel, today } from "@/lib/util";
import CheckInCard from "@/components/CheckInCard";
import TaskRow from "@/components/TaskRow";

export const metadata = { title: "Accueil" };

export default async function MemberHome() {
  const m = await requireMember();
  const projects = await myProjectIds(m.id);
  const [att, tasks, posts] = await Promise.all([
    prisma.attendance.findUnique({ where: { memberId_day: { memberId: m.id, day: today() } } }),
    prisma.task.findMany({ where: { assigneeId: m.id, status: { not: "DONE" } }, take: 20, include: { project: { select: { name: true, color: true } }, _count: { select: { comments: true } } } }),
    prisma.announcement.findMany({ where: visibleTo(projects), orderBy: [{ pinned: "desc" }, { createdAt: "desc" }], take: 3, include: { project: { select: { name: true } } } }),
  ]);
  tasks.sort((a, b) => (a.priority === "HIGH" ? 0 : 1) - (b.priority === "HIGH" ? 0 : 1) || (a.dueDate || "9999").localeCompare(b.dueDate || "9999"));
  return (
    <>
      <h1>Bonjour {m.name.split(" ")[0]} 👋</h1>
      <div className="grid c2">
        <div className="grid" style={{ alignContent: "start" }}>
          <CheckInCard a={att} />
          <div>
            <div className="head" style={{ marginBottom: 8 }}><h2 style={{ margin: 0 }}>Mes tâches</h2><a href="/taches" className="small">Tout voir →</a></div>
            <div className="list">
              {tasks.length === 0 && <div className="empty">Aucune tâche en attente. 👍</div>}
              {tasks.map((t) => <TaskRow key={t.id} t={t} href={`/taches/${t.id}`} />)}
            </div>
          </div>
        </div>
        <div>
          <div className="head" style={{ marginBottom: 8 }}><h2 style={{ margin: 0 }}>Annonces</h2><a href="/annonces" className="small">Tout voir →</a></div>
          <div className="list">
            {posts.length === 0 && <div className="empty">Aucune annonce.</div>}
            {posts.map((p) => (
              <div key={p.id} className="card">
                <b>{p.pinned && "📌 "}{p.title}</b> <span className="muted small">· {p.project?.name ?? "Entreprise"} · {dateTimeLabel(p.createdAt)}</span>
                <div className="prewrap" style={{ marginTop: 6 }}>{p.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

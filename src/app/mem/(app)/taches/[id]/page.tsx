import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/auth";
import { myProjectIds } from "@/lib/memberScope";
import { PRIORITY, STATUS, dateTimeLabel, dayLabel } from "@/lib/util";
import Submit from "@/components/Submit";
import { commentTask, setTaskStatus } from "../../../actions";

export default async function MemberTask({ params }: { params: Promise<{ id: string }> }) {
  const m = await requireMember();
  const { id } = await params;
  const projects = await myProjectIds(m.id);
  const t = await prisma.task.findFirst({
    where: { id, OR: [{ assigneeId: m.id }, { projectId: { in: projects } }] },
    include: { comments: { orderBy: { createdAt: "asc" } }, project: { select: { name: true } }, assignee: { select: { name: true } } },
  });
  if (!t) notFound();
  return (
    <>
      <p style={{ margin: "0 0 8px" }}><a href="/taches">← Tâches</a></p>
      <div className="head"><h1>{t.title}</h1><span className={`badge ${STATUS[t.status].cls}`}>{STATUS[t.status].label}</span></div>
      <p className="muted" style={{ marginTop: -6 }}>
        {t.project?.name ?? "Entreprise"} · {t.assignee ? `confiée à ${t.assignee.name}` : "libre"}
        {t.priority === "HIGH" && <> · <span className={`badge ${PRIORITY.HIGH.cls}`}>Urgent</span></>}
        {t.dueDate && ` · pour le ${dayLabel(t.dueDate)}`}
      </p>
      {t.description && <div className="card prewrap" style={{ marginBottom: 14 }}>{t.description}</div>}
      <div className="chips">
        {(
          [
            [t.status === "TODO", "DOING", "btn", "▶️ Commencer"],
            [t.status !== "DONE", "DONE", "btn", "✅ Marquer comme faite"],
            [t.status === "DONE", "DOING", "btn ghost", "↩️ Rouvrir"],
          ] as const
        )
          .filter(([show]) => show)
          .map(([, st, cls, label]) => (
            <form key={label} action={setTaskStatus}>
              <input type="hidden" name="id" value={t.id} />
              <input type="hidden" name="status" value={st} />
              <Submit className={cls}>{label}</Submit>
            </form>
          ))}
      </div>
      <div className="card">
        <h2>Commentaires</h2>
        <div className="list" style={{ marginBottom: 12 }}>
          {t.comments.length === 0 && <span className="muted small">Aucun commentaire.</span>}
          {t.comments.map((c) => (
            <div key={c.id} style={{ borderLeft: "3px solid var(--line)", paddingLeft: 10 }}>
              <b className="small">{c.author}</b> <span className="muted small">· {dateTimeLabel(c.createdAt)}</span>
              <div className="prewrap">{c.body}</div>
            </div>
          ))}
        </div>
        <form className="form" action={commentTask}>
          <input type="hidden" name="id" value={t.id} />
          <textarea name="body" className="input" placeholder="Une question, un point d'avancement…" required style={{ minHeight: 70 }} />
          <Submit className="btn ghost">Envoyer</Submit>
        </form>
      </div>
    </>
  );
}

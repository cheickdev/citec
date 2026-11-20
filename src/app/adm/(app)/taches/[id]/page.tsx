import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { projectOptions } from "@/lib/projects";
import { STATUS, dateTimeLabel } from "@/lib/util";
import TaskFields from "@/components/TaskForm";
import Submit from "@/components/Submit";
import ActionForm from "@/components/ActionForm";
import { commentTask, deleteTask, updateTask } from "../../../actions";

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await prisma.task.findUnique({ where: { id }, include: { comments: { orderBy: { createdAt: "asc" } }, assignee: { select: { name: true } } } });
  if (!t) notFound();
  const [projects, members] = await Promise.all([projectOptions(), prisma.member.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } })]);
  return (
    <>
      <p style={{ margin: "0 0 8px" }}><a href="/taches">← Tâches</a></p>
      <div className="head"><h1>{t.title}</h1><span className={`badge ${STATUS[t.status].cls}`}>{STATUS[t.status].label}</span></div>
      <div className="chips">
        {(["TODO", "DOING", "DONE"] as const).map((st) => (
          <form key={st} action={updateTask}>
            <input type="hidden" name="id" value={t.id} />
            <input type="hidden" name="status" value={st} />
            <Submit className={`chip ${t.status === st ? "on" : ""}`}>{STATUS[st].label}</Submit>
          </form>
        ))}
      </div>
      <div className="grid c2">
        <form className="card form" action={updateTask}>
          <h2>Modifier</h2>
          <input type="hidden" name="id" value={t.id} />
          <TaskFields projects={projects} members={members} t={t} />
          <p className="muted small" style={{ margin: 0 }}>Créée par {t.createdBy || "—"} le {dateTimeLabel(t.createdAt)}{t.doneAt && ` · faite le ${dateTimeLabel(t.doneAt)}`}</p>
          <Submit>Enregistrer</Submit>
        </form>
        <div className="grid" style={{ alignContent: "start" }}>
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
              <textarea name="body" className="input" placeholder="Écrire un commentaire…" required style={{ minHeight: 70 }} />
              <Submit className="btn ghost">Envoyer</Submit>
            </form>
          </div>
          <ActionForm action={deleteTask} className="">
            <input type="hidden" name="id" value={t.id} />
            <Submit className="btn danger" confirm="Supprimer cette tâche ?">🗑️ Supprimer la tâche</Submit>
          </ActionForm>
        </div>
      </div>
    </>
  );
}

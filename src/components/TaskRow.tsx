import { PRIORITY, STATUS, dayLabel, today } from "@/lib/util";

export interface TaskRowData {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
  project: { name: string; color: string } | null;
  assignee?: { name: string } | null;
  _count?: { comments: number };
}

export default function TaskRow({ t, href }: { t: TaskRowData; href: string }) {
  const late = t.status !== "DONE" && t.dueDate && t.dueDate < today();
  return (
    <a href={href} className="item" style={{ textDecoration: "none", color: "inherit", borderLeft: `4px solid ${t.project?.color ?? "var(--line)"}`, opacity: t.status === "DONE" ? 0.65 : 1 }}>
      <span className="grow">
        <b style={t.status === "DONE" ? { textDecoration: "line-through" } : undefined}>{t.title}</b> {t.priority === "HIGH" && <span className={`badge ${PRIORITY.HIGH.cls}`}>Urgent</span>}
        <br />
        <span className="muted small">
          {t.project?.name ?? "Entreprise"}
          {t.assignee !== undefined && ` · ${t.assignee?.name ?? "Personne"}`}
          {t.dueDate && <span style={late ? { color: "var(--danger)", fontWeight: 650 } : undefined}> · {late ? "en retard, " : ""}pour le {dayLabel(t.dueDate)}</span>}
          {t._count?.comments ? ` · 💬 ${t._count.comments}` : ""}
        </span>
      </span>
      <span className={`badge ${STATUS[t.status].cls}`}>{STATUS[t.status].label}</span>
    </a>
  );
}

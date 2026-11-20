import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/auth";
import { myProjectIds, visibleTo } from "@/lib/memberScope";
import { dateTimeLabel } from "@/lib/util";

export const metadata = { title: "Annonces et documents" };

export default async function MemberPosts() {
  const m = await requireMember();
  const projects = await myProjectIds(m.id);
  const [posts, docs] = await Promise.all([
    prisma.announcement.findMany({ where: visibleTo(projects), orderBy: [{ pinned: "desc" }, { createdAt: "desc" }], take: 100, include: { project: { select: { name: true } } } }),
    prisma.document.findMany({ where: visibleTo(projects), orderBy: { createdAt: "desc" }, take: 200, include: { project: { select: { name: true } } } }),
  ]);
  return (
    <>
      <h1>Annonces et documents</h1>
      <div className="grid c2">
        <div>
          <h2>📣 Annonces</h2>
          <div className="list">
            {posts.length === 0 && <div className="empty">Aucune annonce.</div>}
            {posts.map((p) => (
              <div key={p.id} className="card">
                <b>{p.pinned && "📌 "}{p.title}</b>
                <div className="muted small">{p.project?.name ?? "Toute l'entreprise"} · {dateTimeLabel(p.createdAt)}</div>
                <div className="prewrap" style={{ marginTop: 6 }}>{p.body}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2>📁 Documents</h2>
          <div className="list">
            {docs.length === 0 && <div className="empty">Aucun document.</div>}
            {docs.map((d) => (
              <a key={d.id} href={d.url} target="_blank" rel="noopener noreferrer" className="item" style={{ textDecoration: "none", color: "inherit" }}>
                <span className="grow"><b>📄 {d.title}</b><br /><span className="muted small">{d.project?.name ?? "Toute l'entreprise"} · {dateTimeLabel(d.createdAt)}</span></span>
                <span className="btn ghost sm">Ouvrir</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

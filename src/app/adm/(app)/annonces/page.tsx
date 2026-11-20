import { prisma } from "@/lib/db";
import { projectOptions } from "@/lib/projects";
import { dateTimeLabel } from "@/lib/util";
import ProjectSelect from "@/components/ProjectSelect";
import Submit from "@/components/Submit";
import { createPost, deletePost, togglePin } from "../../actions";

export const metadata = { title: "Annonces" };

export default async function Posts() {
  const [posts, projects] = await Promise.all([prisma.announcement.findMany({ orderBy: [{ pinned: "desc" }, { createdAt: "desc" }], take: 100, include: { project: { select: { name: true } } } }), projectOptions()]);
  return (
    <>
      <h1>Annonces</h1>
      <form className="card form" action={createPost} style={{ marginBottom: 16 }}>
        <h2>Nouvelle annonce</h2>
        <div className="field"><label htmlFor="at">Titre</label><input id="at" name="title" className="input" required /></div>
        <div className="field"><label htmlFor="ab">Message</label><textarea id="ab" name="body" className="input" required /></div>
        <div className="row">
          <ProjectSelect projects={projects} label="Pour" empty="Toute l'entreprise" />
          <label className="field" style={{ justifyContent: "flex-end" }}><span><input type="checkbox" name="pinned" /> 📌 Épingler en haut</span></label>
        </div>
        <Submit>Publier</Submit>
      </form>
      <div className="list">
        {posts.length === 0 && <div className="empty">Aucune annonce.</div>}
        {posts.map((p) => (
          <div key={p.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <b>{p.pinned && "📌 "}{p.title}</b>
              <span className="muted small">{p.project?.name ?? "Toute l'entreprise"} · {dateTimeLabel(p.createdAt)}</span>
            </div>
            <div className="prewrap" style={{ margin: "6px 0 10px" }}>{p.body}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <form action={togglePin}><input type="hidden" name="id" value={p.id} /><Submit className="btn ghost sm">{p.pinned ? "Désépingler" : "📌 Épingler"}</Submit></form>
              <form action={deletePost}><input type="hidden" name="id" value={p.id} /><Submit className="btn danger sm" confirm="Supprimer cette annonce ?">Supprimer</Submit></form>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

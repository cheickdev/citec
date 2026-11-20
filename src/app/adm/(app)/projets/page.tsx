import { prisma } from "@/lib/db";
import { ensureProjects } from "@/lib/projects";
import Submit from "@/components/Submit";
import { newProjectKey, saveProject } from "../../actions";

export const metadata = { title: "Projets" };

type P = { id?: string; name?: string; url?: string; color?: string; summary?: string; statsUrl?: string; kind?: string; active?: boolean };

function Fields({ p }: { p: P }) {
  return (
    <>
      {p.id && <input type="hidden" name="id" value={p.id} />}
      <div className="row">
        <div className="field"><label>Nom</label><input name="name" className="input" defaultValue={p.name} required /></div>
        <div className="field"><label>Site</label><input name="url" className="input" defaultValue={p.url} placeholder="https://…" /></div>
      </div>
      <div className="field"><label>Description</label><input name="summary" className="input" defaultValue={p.summary} /></div>
      <div className="row">
        <div className="field"><label>Couleur</label><input name="color" type="color" className="input" defaultValue={p.color ?? "#1d4ed8"} style={{ height: 42, padding: 4 }} /></div>
        <div className="field">
          <label>Chiffres en direct</label>
          <select name="kind" className="input" defaultValue={p.kind ?? "other"}>
            <option value="other">Aucun (projet suivi par les tâches)</option>
            <option value="simplepos">Type Simple Pos</option>
            <option value="2mt">Type 2MT Shopping</option>
            <option value="freephone">Type FreePhone</option>
          </select>
        </div>
      </div>
      <div className="field"><label>Adresse des chiffres</label><input name="statsUrl" className="input" defaultValue={p.statsUrl} placeholder="https://…/api/citec/stats" /></div>
      {p.id && (
        <div className="field">
          <label>Projet</label>
          <select name="active" className="input" defaultValue={p.active === false ? "off" : "on"}>
            <option value="on">Actif</option>
            <option value="off">Archivé</option>
          </select>
        </div>
      )}
    </>
  );
}

export default async function Projects() {
  await ensureProjects();
  const projects = await prisma.project.findMany({ orderBy: [{ active: "desc" }, { order: "asc" }, { name: "asc" }], include: { _count: { select: { members: true, tasks: { where: { status: { not: "DONE" } } } } } } });
  return (
    <>
      <div className="head"><h1>Projets</h1></div>
      <details className="card" style={{ marginBottom: 16 }}>
        <summary>➕ Nouveau projet</summary>
        <form className="form" action={saveProject}><Fields p={{}} /><Submit>Créer le projet</Submit></form>
      </details>
      <div className="grid c2">
        {projects.map((p) => (
          <details key={p.id} className="card proj" style={{ ["--c" as string]: p.color, opacity: p.active ? 1 : 0.6 }}>
            <summary>
              <span style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span>{p.name} {!p.active && <span className="badge">Archivé</span>}</span>
                <span className="muted small">{p._count.members} membre(s) · {p._count.tasks} tâche(s)</span>
              </span>
              <span className="muted small" style={{ fontWeight: 400, display: "block" }}>{p.summary || p.url}</span>
            </summary>
            <form className="form" action={saveProject}>
              <Fields p={p} />
              <Submit>Enregistrer</Submit>
            </form>
            {p.kind !== "other" && (
              <form className="form" action={newProjectKey} style={{ marginTop: 14, borderTop: "1px solid var(--line)", paddingTop: 12 }}>
                <input type="hidden" name="id" value={p.id} />
                <div className="field">
                  <label>Clé secrète des chiffres (à mettre dans le projet : CITEC_STATS_KEY)</label>
                  <input className="input" readOnly value={p.statsKey} style={{ fontFamily: "monospace", fontSize: 12 }} />
                </div>
                <Submit className="btn ghost sm" confirm="Créer une nouvelle clé ? L'ancienne ne marchera plus : il faudra changer CITEC_STATS_KEY dans le projet.">🔁 Nouvelle clé</Submit>
              </form>
            )}
          </details>
        ))}
      </div>
    </>
  );
}

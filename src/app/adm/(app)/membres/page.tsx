import { prisma } from "@/lib/db";
import { ensureProjects, projectOptions } from "@/lib/projects";
import { fcfa } from "@/lib/util";
import ActionForm from "@/components/ActionForm";
import Submit from "@/components/Submit";
import { createMember } from "../../actions";

export const metadata = { title: "Membres" };

export default async function Members() {
  await ensureProjects();
  const [members, projects] = await Promise.all([
    prisma.member.findMany({ orderBy: [{ active: "desc" }, { name: "asc" }], include: { projects: { include: { project: { select: { name: true, color: true } } } }, _count: { select: { tasks: { where: { status: { not: "DONE" } } } } } } }),
    projectOptions(),
  ]);
  return (
    <>
      <div className="head"><h1>Membres</h1><span className="muted">{members.filter((m) => m.active).length} actifs</span></div>
      <details className="card" style={{ marginBottom: 16 }} open={members.length === 0}>
        <summary>➕ Ajouter un membre</summary>
        <ActionForm action={createMember} className="form">
          <div className="row">
            <div className="field"><label htmlFor="n">Nom complet</label><input id="n" name="name" className="input" required /></div>
            <div className="field"><label htmlFor="p">Téléphone (sert à se connecter)</label><input id="p" name="phone" className="input" inputMode="tel" required /></div>
          </div>
          <div className="row">
            <div className="field"><label htmlFor="j">Poste</label><input id="j" name="jobTitle" className="input" placeholder="Ex. Agent commercial" /></div>
            <div className="field"><label htmlFor="e">E-mail (facultatif)</label><input id="e" name="email" type="email" className="input" /></div>
          </div>
          <div className="row">
            <div className="field"><label htmlFor="s">Salaire mensuel (F CFA)</label><input id="s" name="salary" className="input" inputMode="numeric" placeholder="0 si commission seulement" /></div>
            <div className="field"><label htmlFor="pw">Mot de passe de départ</label><input id="pw" name="password" className="input" required minLength={6} placeholder="6 caractères au moins" /></div>
          </div>
          <div className="field">
            <label>Projets</label>
            <div className="chips" style={{ margin: 0 }}>
              {projects.map((p) => (
                <label key={p.id} className="chip"><input type="checkbox" name="projects" value={p.id} /> {p.name}</label>
              ))}
            </div>
          </div>
          <div className="field">
            <label htmlFor="r">Accès</label>
            <select id="r" name="role" className="input" defaultValue="MEMBER">
              <option value="MEMBER">Membre (member.citec.app)</option>
              <option value="ADMIN">Administrateur (aussi admin.citec.app)</option>
            </select>
          </div>
          <Submit>Créer le membre</Submit>
        </ActionForm>
      </details>
      <div className="list">
        {members.length === 0 && <div className="empty">Aucun membre pour le moment.</div>}
        {members.map((m) => (
          <a key={m.id} href={`/membres/${m.id}`} className="item" style={{ textDecoration: "none", color: "inherit", opacity: m.active ? 1 : 0.55 }}>
            <span className="grow">
              <b>{m.name}</b> {m.role === "ADMIN" && <span className="badge blue">Admin</span>} {!m.active && <span className="badge">Désactivé</span>}
              <br />
              <span className="muted small">{m.jobTitle || "—"} · {m.phone}{m.salary ? ` · ${fcfa(m.salary)}/mois` : ""}</span>
              <br />
              {m.projects.map((p) => <span key={p.projectId} className="badge" style={{ marginRight: 4, background: p.project.color + "22", color: p.project.color }}>{p.project.name}</span>)}
            </span>
            <span className="badge">{m._count.tasks} tâche(s)</span>
          </a>
        ))}
      </div>
    </>
  );
}

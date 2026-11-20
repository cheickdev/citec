import { prisma } from "@/lib/db";
import { projectOptions } from "@/lib/projects";
import { dateTimeLabel } from "@/lib/util";
import ActionForm from "@/components/ActionForm";
import ProjectSelect from "@/components/ProjectSelect";
import Submit from "@/components/Submit";
import { deleteDocument, uploadDocument } from "../../actions";

export const metadata = { title: "Documents" };
const size = (n: number) => (n > 1e6 ? `${(n / 1e6).toFixed(1)} Mo` : `${Math.max(1, Math.round(n / 1e3))} Ko`);

export default async function Docs() {
  const [docs, projects] = await Promise.all([prisma.document.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { project: { select: { name: true } } } }), projectOptions()]);
  return (
    <>
      <h1>Documents</h1>
      <ActionForm action={uploadDocument} reset>
        <h2>Partager un document</h2>
        <div className="row">
          <div className="field"><label htmlFor="df">Fichier (10 Mo au plus)</label><input id="df" name="file" type="file" className="input" required /></div>
          <div className="field"><label htmlFor="dt">Titre (facultatif)</label><input id="dt" name="title" className="input" placeholder="Ex. Règlement intérieur" /></div>
        </div>
        <ProjectSelect projects={projects} label="Pour" />
        <Submit>Envoyer</Submit>
      </ActionForm>
      <div className="list" style={{ marginTop: 16 }}>
        {docs.length === 0 && <div className="empty">Aucun document.</div>}
        {docs.map((d) => (
          <div key={d.id} className="item">
            <span className="grow"><a href={d.url} target="_blank" rel="noopener noreferrer"><b>📄 {d.title}</b></a><br /><span className="muted small">{d.project?.name ?? "Toute l'entreprise"} · {size(d.size)} · {dateTimeLabel(d.createdAt)}</span></span>
            <form action={deleteDocument}><input type="hidden" name="id" value={d.id} /><Submit className="btn danger sm" confirm="Supprimer ce document ?">Supprimer</Submit></form>
          </div>
        ))}
      </div>
    </>
  );
}

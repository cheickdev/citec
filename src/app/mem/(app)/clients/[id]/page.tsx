import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/auth";
import { projectOptions } from "@/lib/projects";
import ActionForm from "@/components/ActionForm";
import ProspectFields from "@/components/ProspectFields";
import Submit from "@/components/Submit";
import { deleteProspect, saveProspect } from "../../../actions";

export default async function EditProspect({ params }: { params: Promise<{ id: string }> }) {
  const m = await requireMember();
  const { id } = await params;
  const p = await prisma.prospect.findFirst({ where: { id, memberId: m.id } });
  if (!p) notFound();
  const projects = await projectOptions();
  const wa = p.phone.replace(/\D/g, "");
  return (
    <>
      <p style={{ margin: "0 0 8px" }}><a href="/clients">← Clients à contacter</a></p>
      <div className="head">
        <h1>{p.name}</h1>
        {wa && (
          <span style={{ display: "flex", gap: 6 }}>
            <a className="btn ghost sm" href={`tel:${p.phone.replace(/[^\d+]/g, "")}`}>📞 Appeler</a>
            <a className="btn ghost sm" href={`https://wa.me/${wa.length === 8 ? "223" + wa : wa}`} target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
          </span>
        )}
      </div>
      <ActionForm action={saveProspect} className="card form">
        <input type="hidden" name="id" value={p.id} />
        <ProspectFields p={p} projects={projects} />
        <Submit>Enregistrer</Submit>
      </ActionForm>
      <ActionForm action={deleteProspect} className="" >
        <input type="hidden" name="id" value={p.id} />
        <div style={{ marginTop: 14 }}><Submit className="btn danger" confirm={`Supprimer ${p.name} ?`}>🗑️ Supprimer ce client</Submit></div>
      </ActionForm>
    </>
  );
}

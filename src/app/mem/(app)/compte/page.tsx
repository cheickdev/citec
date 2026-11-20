import { requireMember } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ActionForm from "@/components/ActionForm";
import Submit from "@/components/Submit";
import { changePassword } from "../../actions";

export const metadata = { title: "Mon compte" };

export default async function Account() {
  const m = await requireMember();
  const projects = await prisma.projectMember.findMany({ where: { memberId: m.id }, include: { project: { select: { name: true } } } });
  return (
    <>
      <h1>Mon compte</h1>
      <div className="grid c2" style={{ maxWidth: 820 }}>
        <div className="card">
          <h2>{m.name}</h2>
          <div className="kv">
            <span>Poste</span><b>{m.jobTitle || "—"}</b>
            <span>Téléphone</span><b>{m.phone}</b>
            <span>Projets</span><b>{projects.map((p) => p.project.name).join(", ") || "—"}</b>
          </div>
        </div>
        <ActionForm action={changePassword} reset>
          <h2>Changer mon mot de passe</h2>
          <div className="field"><label htmlFor="c">Mot de passe actuel</label><input id="c" name="current" type="password" className="input" required /></div>
          <div className="field"><label htmlFor="n">Nouveau mot de passe</label><input id="n" name="next" type="password" className="input" minLength={6} required /></div>
          <Submit>Enregistrer</Submit>
        </ActionForm>
      </div>
    </>
  );
}

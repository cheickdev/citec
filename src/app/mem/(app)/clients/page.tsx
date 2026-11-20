import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/auth";
import { projectOptions } from "@/lib/projects";
import { P_STATUS } from "@/lib/prospects";
import { fcfa, thisMonth, today } from "@/lib/util";
import ActionForm from "@/components/ActionForm";
import ProspectFields from "@/components/ProspectFields";
import ProspectRow from "@/components/ProspectRow";
import Submit from "@/components/Submit";
import { saveProspect } from "../../actions";

export const metadata = { title: "Clients à contacter" };

export default async function MyProspects({ searchParams }: { searchParams: Promise<{ s?: string; q?: string }> }) {
  const m = await requireMember();
  const { s = "", q = "" } = await searchParams;
  const [list, projects, fees] = await Promise.all([
    prisma.prospect.findMany({
      where: {
        memberId: m.id,
        ...(s === "rdv" ? { meetingDate: { gte: today() }, status: { notIn: ["WON", "LOST"] } } : P_STATUS[s] ? { status: s } : {}),
        ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { phone: { contains: q } }, { quartier: { contains: q, mode: "insensitive" as const } }, { account: { contains: q, mode: "insensitive" as const } }] } : {}),
      },
      orderBy: s === "rdv" ? [{ meetingDate: "asc" }, { meetingTime: "asc" }] : { createdAt: "desc" },
      take: 300,
      include: { project: { select: { name: true, color: true } } },
    }),
    projectOptions(),
    prisma.prospect.aggregate({ where: { memberId: m.id, meetingDate: { startsWith: thisMonth() } }, _sum: { travelFee: true } }),
  ]);
  const chip = (k: string, l: string) => <a key={k} href={`?s=${k}`} className={`chip ${s === k ? "on" : ""}`}>{l}</a>;
  return (
    <>
      <div className="head"><h1>Clients à contacter</h1><span className="muted small">Frais de déplacement ce mois : <b>{fcfa(fees._sum.travelFee ?? 0)}</b></span></div>
      <details className="card" style={{ marginBottom: 16 }}>
        <summary>➕ Ajouter un client</summary>
        <ActionForm action={saveProspect} className="form" reset>
          <ProspectFields projects={projects} />
          <Submit>Enregistrer le client</Submit>
        </ActionForm>
      </details>
      <div className="chips">
        {chip("", "Tous")}
        {chip("rdv", "📅 Rendez-vous à venir")}
        {Object.entries(P_STATUS).map(([k, v]) => chip(k, v.label))}
      </div>
      <form className="chips" method="get">
        <input type="hidden" name="s" value={s} />
        <input name="q" className="input" defaultValue={q} placeholder="Rechercher : nom, téléphone, quartier, compte…" style={{ maxWidth: 360 }} />
        <button className="btn ghost sm">Chercher</button>
      </form>
      <div className="list">
        {list.length === 0 && <div className="empty">Aucun client ici.</div>}
        {list.map((p) => <ProspectRow key={p.id} p={p} href={`/clients/${p.id}`} />)}
      </div>
    </>
  );
}

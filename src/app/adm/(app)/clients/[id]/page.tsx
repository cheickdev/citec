import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { P_STATUS } from "@/lib/prospects";
import { dateTimeLabel, dayLabel, fcfa } from "@/lib/util";

export default async function ProspectView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await prisma.prospect.findUnique({ where: { id }, include: { member: { select: { name: true, phone: true } }, project: { select: { name: true } } } });
  if (!p) notFound();
  const wa = p.phone.replace(/\D/g, "");
  const rows: [string, string][] = [
    ["Contact", p.phone || "—"],
    ["Quartier", p.quartier || "—"],
    ["Sexe", p.gender === "F" ? "Femme" : p.gender === "M" ? "Homme" : "—"],
    ["Réseau social", p.network || "—"],
    ["Nom du compte", p.account || "—"],
    ["Rendez-vous", p.meeting || "—"],
    ["Date du rendez-vous", p.meetingDate ? dayLabel(p.meetingDate) : "—"],
    ["Heure", p.meetingTime || "—"],
    ["Frais de déplacement", fcfa(p.travelFee)],
    ["Projet", p.project?.name ?? "—"],
    ["Ajouté par", `${p.member.name} (${p.member.phone})`],
    ["Ajouté le", dateTimeLabel(p.createdAt)],
    ["Modifié le", dateTimeLabel(p.updatedAt)],
  ];
  return (
    <>
      <p style={{ margin: "0 0 8px" }}><a href="/clients">← Clients à contacter</a></p>
      <div className="head">
        <h1>{p.name}</h1>
        <span className={`badge ${P_STATUS[p.status]?.cls ?? ""}`} style={{ fontSize: 14 }}>{P_STATUS[p.status]?.label}</span>
      </div>
      <div className="card" style={{ maxWidth: 620 }}>
        <div className="kv">{rows.map(([k, v]) => [<span key={k} className="muted">{k}</span>, <b key={k + "v"}>{v}</b>])}</div>
        {p.note && <p className="prewrap" style={{ margin: "12px 0 0" }}>{p.note}</p>}
        {wa && (
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <a className="btn ghost sm" href={`tel:${p.phone.replace(/[^\d+]/g, "")}`}>📞 Appeler</a>
            <a className="btn ghost sm" href={`https://wa.me/${wa.length === 8 ? "223" + wa : wa}`} target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
          </div>
        )}
      </div>
    </>
  );
}

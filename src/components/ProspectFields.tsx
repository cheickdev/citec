import { NETWORKS, P_STATUS } from "@/lib/prospects";
import ProjectSelect from "@/components/ProjectSelect";

export interface ProspectValues {
  name: string; phone: string; quartier: string; gender: string; network: string; account: string;
  meeting: string; meetingDate: string; meetingTime: string; travelFee: number; status: string; note: string; projectId: string | null;
}

/** Champs d'un client a contacter (ajout et modification). */
export default function ProspectFields({ p, projects }: { p?: ProspectValues; projects: { id: string; name: string }[] }) {
  return (
    <>
      <div className="row">
        <div className="field"><label htmlFor="pn">Nom du client</label><input id="pn" name="name" className="input" defaultValue={p?.name} required /></div>
        <div className="field"><label htmlFor="pp">Contact (téléphone)</label><input id="pp" name="phone" className="input" inputMode="tel" defaultValue={p?.phone} /></div>
      </div>
      <div className="row">
        <div className="field"><label htmlFor="pq">Quartier</label><input id="pq" name="quartier" className="input" defaultValue={p?.quartier} /></div>
        <div className="field">
          <label htmlFor="pg">Sexe</label>
          <select id="pg" name="gender" className="input" defaultValue={p?.gender ?? ""}>
            <option value="">—</option>
            <option value="F">Femme</option>
            <option value="M">Homme</option>
          </select>
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="pr">Réseau social</label>
          <input id="pr" name="network" className="input" list="networks" defaultValue={p?.network} placeholder="Ex. TikTok" />
          <datalist id="networks">{NETWORKS.map((n) => <option key={n} value={n} />)}</datalist>
        </div>
        <div className="field"><label htmlFor="pa">Nom du compte</label><input id="pa" name="account" className="input" defaultValue={p?.account} placeholder="Ex. @awa_boutique" /></div>
      </div>
      <div className="field"><label htmlFor="pm">Rendez-vous (lieu, objet)</label><input id="pm" name="meeting" className="input" defaultValue={p?.meeting} placeholder="Ex. À sa boutique, présentation de Simple Pos" /></div>
      <div className="row">
        <div className="field"><label htmlFor="pd">Date du rendez-vous</label><input id="pd" name="meetingDate" type="date" className="input" defaultValue={p?.meetingDate} /></div>
        <div className="field"><label htmlFor="pt">Heure</label><input id="pt" name="meetingTime" type="time" className="input" defaultValue={p?.meetingTime} /></div>
        <div className="field"><label htmlFor="pf">Frais de déplacement (F CFA)</label><input id="pf" name="travelFee" className="input num" inputMode="numeric" defaultValue={p?.travelFee || ""} /></div>
      </div>
      <div className="row">
        <ProjectSelect projects={projects} value={p?.projectId} label="Pour le projet" empty="—" />
        <div className="field">
          <label htmlFor="ps">Où en est-on ?</label>
          <select id="ps" name="status" className="input" defaultValue={p?.status ?? "TODO"}>
            {Object.entries(P_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>
      <div className="field"><label htmlFor="pno">Note (facultatif)</label><textarea id="pno" name="note" className="input" defaultValue={p?.note} style={{ minHeight: 60 }} /></div>
    </>
  );
}

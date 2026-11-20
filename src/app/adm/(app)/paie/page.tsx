import { prisma } from "@/lib/db";
import { addMonths, dateTimeLabel, fcfa, monthLabel, thisMonth } from "@/lib/util";
import Submit from "@/components/Submit";
import { payPayslip, preparePayroll, savePayslip, unpayPayslip } from "../../actions";

export const metadata = { title: "Paie" };

export default async function Payroll({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { m } = await searchParams;
  const month = /^\d{4}-\d{2}$/.test(m ?? "") ? m! : thisMonth();
  const slips = await prisma.payslip.findMany({ where: { month }, include: { member: { select: { name: true, jobTitle: true } } }, orderBy: { member: { name: "asc" } } });
  const total = (p: (typeof slips)[number]) => p.base + p.commission + p.bonus - p.deduction;
  const sum = slips.reduce((a, p) => a + total(p), 0);
  const paid = slips.filter((p) => p.paidAt).reduce((a, p) => a + total(p), 0);
  return (
    <>
      <div className="head">
        <h1>Paie · {monthLabel(month)}</h1>
        <div style={{ display: "flex", gap: 6 }}>
          <a className="btn ghost sm" href={`?m=${addMonths(month, -1)}`}>←</a>
          <a className="btn ghost sm" href={`?m=${addMonths(month, 1)}`}>→</a>
        </div>
      </div>
      <div className="tiles">
        <div className="tile"><div className="label">Total du mois</div><div className="value num">{fcfa(sum)}</div></div>
        <div className="tile"><div className="label">Déjà payé</div><div className="value num" style={{ color: "var(--ok)" }}>{fcfa(paid)}</div></div>
        <div className="tile"><div className="label">Reste à payer</div><div className="value num" style={{ color: sum - paid ? "var(--warn)" : undefined }}>{fcfa(sum - paid)}</div></div>
      </div>
      <form action={preparePayroll} style={{ marginBottom: 14 }}>
        <input type="hidden" name="month" value={month} />
        <Submit className="btn ghost">🧾 Préparer les fiches du mois (salaire de base de chaque membre)</Submit>
      </form>
      <div className="list">
        {slips.length === 0 && <div className="empty">Aucune fiche pour ce mois. Touchez « Préparer les fiches du mois ».</div>}
        {slips.map((p) => (
          <div key={p.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              <span><b>{p.member.name}</b> <span className="muted small">{p.member.jobTitle}</span></span>
              <span><b className="num">{fcfa(total(p))}</b> <span className={`badge ${p.paidAt ? "ok" : "warn"}`}>{p.paidAt ? `Payé le ${dateTimeLabel(p.paidAt)}` : "À payer"}</span></span>
            </div>
            {p.paidAt ? (
              <form action={unpayPayslip}>
                <input type="hidden" name="id" value={p.id} />
                <p className="muted small" style={{ margin: "0 0 8px" }}>Base {fcfa(p.base)} · commission {fcfa(p.commission)} · prime {fcfa(p.bonus)} · retenue {fcfa(p.deduction)}{p.note && ` · ${p.note}`}</p>
                <Submit className="btn ghost sm" confirm="Annuler le paiement ? La dépense sera retirée des finances.">Annuler le paiement</Submit>
              </form>
            ) : (
              <form className="form" action={savePayslip}>
                <input type="hidden" name="id" value={p.id} />
                <div className="row">
                  <div className="field"><label>Salaire de base</label><input name="base" className="input num" inputMode="numeric" defaultValue={p.base || ""} /></div>
                  <div className="field"><label>Commission</label><input name="commission" className="input num" inputMode="numeric" defaultValue={p.commission || ""} /></div>
                  <div className="field"><label>Prime</label><input name="bonus" className="input num" inputMode="numeric" defaultValue={p.bonus || ""} /></div>
                  <div className="field"><label>Retenue</label><input name="deduction" className="input num" inputMode="numeric" defaultValue={p.deduction || ""} /></div>
                </div>
                <div className="field"><label>Note (visible par le membre)</label><input name="note" className="input" defaultValue={p.note} placeholder="Ex. 12 abonnements Simple Pos vendus" /></div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Submit className="btn ghost">Enregistrer</Submit>
                  <Submit className="btn" formAction={payPayslip} confirm="Marquer comme payé ? La dépense sera ajoutée aux finances.">✅ Payé</Submit>
                </div>
              </form>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

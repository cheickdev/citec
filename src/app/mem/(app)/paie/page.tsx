import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/auth";
import { dateTimeLabel, fcfa, monthLabel } from "@/lib/util";

export const metadata = { title: "Ma paie" };

export default async function MyPay() {
  const m = await requireMember();
  const slips = await prisma.payslip.findMany({ where: { memberId: m.id }, orderBy: { month: "desc" }, take: 24 });
  return (
    <>
      <h1>Ma paie</h1>
      <div className="list" style={{ maxWidth: 620 }}>
        {slips.length === 0 && <div className="empty">Aucune fiche de paie pour le moment.</div>}
        {slips.map((p) => (
          <div key={p.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <b style={{ textTransform: "capitalize" }}>{monthLabel(p.month)}</b>
              <span className={`badge ${p.paidAt ? "ok" : "warn"}`}>{p.paidAt ? `Payé le ${dateTimeLabel(p.paidAt)}` : "En préparation"}</span>
            </div>
            <div className="kv" style={{ marginTop: 10 }}>
              <span>Salaire de base</span><b>{fcfa(p.base)}</b>
              {p.commission > 0 && <><span>Commission</span><b>{fcfa(p.commission)}</b></>}
              {p.bonus > 0 && <><span>Prime</span><b>{fcfa(p.bonus)}</b></>}
              {p.deduction > 0 && <><span>Retenue</span><b>−{fcfa(p.deduction)}</b></>}
              <span style={{ fontWeight: 700 }}>Total</span><b style={{ fontSize: 18 }}>{fcfa(p.base + p.commission + p.bonus - p.deduction)}</b>
            </div>
            {p.note && <p className="muted small" style={{ margin: "8px 0 0" }}>{p.note}</p>}
          </div>
        ))}
      </div>
    </>
  );
}

import { prisma } from "@/lib/db";
import { P_STATUS } from "@/lib/prospects";
import { addMonths, fcfa, monthLabel, thisMonth, today } from "@/lib/util";
import ProspectRow from "@/components/ProspectRow";

export const metadata = { title: "Clients à contacter" };

export default async function AllProspects({ searchParams }: { searchParams: Promise<{ m?: string; s?: string; q?: string; mo?: string }> }) {
  const { m = "", s = "", q = "", mo } = await searchParams;
  const month = /^\d{4}-\d{2}$/.test(mo ?? "") ? mo! : thisMonth();
  const where = {
    ...(m ? { memberId: m } : {}),
    ...(s === "rdv" ? { meetingDate: { gte: today() }, status: { notIn: ["WON", "LOST"] } } : P_STATUS[s] ? { status: s } : {}),
    ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { phone: { contains: q } }, { quartier: { contains: q, mode: "insensitive" as const } }, { account: { contains: q, mode: "insensitive" as const } }] } : {}),
  };
  const [list, members, monthRows] = await Promise.all([
    prisma.prospect.findMany({ where, orderBy: s === "rdv" ? [{ meetingDate: "asc" }, { meetingTime: "asc" }] : { createdAt: "desc" }, take: 400, include: { project: { select: { name: true, color: true } }, member: { select: { name: true } } } }),
    prisma.member.findMany({ where: { prospects: { some: {} } }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    // Activite du mois : clients ajoutes, et frais des rendez-vous du mois
    prisma.prospect.findMany({ where: { OR: [{ createdAt: { gte: new Date(`${month}-01T00:00:00Z`), lt: new Date(`${addMonths(month, 1)}-01T00:00:00Z`) } }, { meetingDate: { startsWith: month } }] }, select: { memberId: true, status: true, travelFee: true, meetingDate: true, createdAt: true } }),
  ]);
  const inMonth = (d: Date) => d.toISOString().slice(0, 7) === month;
  const per = members.map((x) => {
    const mine = monthRows.filter((r) => r.memberId === x.id);
    return {
      ...x,
      added: mine.filter((r) => inMonth(r.createdAt)).length,
      meetings: mine.filter((r) => r.meetingDate.startsWith(month)).length,
      won: mine.filter((r) => r.status === "WON" && inMonth(r.createdAt)).length,
      fees: mine.filter((r) => r.meetingDate.startsWith(month)).reduce((a, r) => a + r.travelFee, 0),
    };
  });
  const tot = per.reduce((a, r) => ({ added: a.added + r.added, meetings: a.meetings + r.meetings, won: a.won + r.won, fees: a.fees + r.fees }), { added: 0, meetings: 0, won: 0, fees: 0 });
  const qs = (o: Record<string, string>) => "?" + new URLSearchParams({ m, s, q, mo: month, ...o }).toString();
  return (
    <>
      <div className="head">
        <h1>Clients à contacter</h1>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <a className="btn ghost sm" href={qs({ mo: addMonths(month, -1) })}>←</a>
          <b style={{ textTransform: "capitalize" }}>{monthLabel(month)}</b>
          <a className="btn ghost sm" href={qs({ mo: addMonths(month, 1) })}>→</a>
        </div>
      </div>
      <div className="tiles">
        <div className="tile"><div className="label">Clients ajoutés</div><div className="value">{tot.added}</div></div>
        <div className="tile"><div className="label">Rendez-vous</div><div className="value">{tot.meetings}</div></div>
        <div className="tile"><div className="label">Clients gagnés</div><div className="value" style={{ color: "var(--ok)" }}>{tot.won}</div></div>
        <div className="tile"><div className="label">Frais de déplacement</div><div className="value num">{fcfa(tot.fees)}</div></div>
      </div>
      {per.length > 0 && (
        <div className="card scroll-x" style={{ marginBottom: 16 }}>
          <h2>Par membre · {monthLabel(month)}</h2>
          <table className="t">
            <thead><tr><th>Membre</th><th className="r">Ajoutés</th><th className="r">Rendez-vous</th><th className="r">Gagnés</th><th className="r">Frais</th></tr></thead>
            <tbody>
              {per.map((r) => (
                <tr key={r.id}><td><a href={qs({ m: r.id })}>{r.name}</a></td><td className="r num">{r.added}</td><td className="r num">{r.meetings}</td><td className="r num">{r.won}</td><td className="r num">{fcfa(r.fees)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="chips">
        <a href={qs({ s: "" })} className={`chip ${!s ? "on" : ""}`}>Tous</a>
        <a href={qs({ s: "rdv" })} className={`chip ${s === "rdv" ? "on" : ""}`}>📅 Rendez-vous à venir</a>
        {Object.entries(P_STATUS).map(([k, v]) => <a key={k} href={qs({ s: k })} className={`chip ${s === k ? "on" : ""}`}>{v.label}</a>)}
      </div>
      <form className="chips" method="get">
        <input type="hidden" name="s" value={s} /><input type="hidden" name="mo" value={month} />
        <select name="m" className="input" defaultValue={m} style={{ maxWidth: 220 }}>
          <option value="">Tous les membres</option>
          {members.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
        <input name="q" className="input" defaultValue={q} placeholder="Nom, téléphone, quartier, compte…" style={{ maxWidth: 300 }} />
        <button className="btn ghost sm">Filtrer</button>
      </form>
      <div className="list">
        {list.length === 0 && <div className="empty">Aucun client ici.</div>}
        {list.map((p) => <ProspectRow key={p.id} p={p} href={`/clients/${p.id}`} />)}
      </div>
    </>
  );
}

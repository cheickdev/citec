import { prisma } from "@/lib/db";
import { dayLabel, monthLabel, thisMonth, timeLabel, today } from "@/lib/util";

export const metadata = { title: "Présence" };

const hours = (a: { inAt: Date; outAt: Date | null }) => (a.outAt ? (a.outAt.getTime() - a.inAt.getTime()) / 3600_000 : 0);

export default async function Presence({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  const { d } = await searchParams;
  const day = /^\d{4}-\d{2}-\d{2}$/.test(d ?? "") ? d! : today();
  const month = day.slice(0, 7);
  const [members, rows, monthRows] = await Promise.all([
    prisma.member.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true, jobTitle: true } }),
    prisma.attendance.findMany({ where: { day } }),
    prisma.attendance.findMany({ where: { day: { startsWith: month } } }),
  ]);
  const byMember = new Map(rows.map((r) => [r.memberId, r]));
  return (
    <>
      <div className="head">
        <h1>Présence</h1>
        <form method="get" style={{ display: "flex", gap: 8 }}>
          <input type="date" name="d" className="input" defaultValue={day} max={today()} />
          <button className="btn ghost sm">Voir</button>
        </form>
      </div>
      <h2>{dayLabel(day)}{day === today() && " (aujourd'hui)"} · {rows.length}/{members.length} présent(s)</h2>
      <div className="list" style={{ marginBottom: 20 }}>
        {members.length === 0 && <div className="empty">Aucun membre.</div>}
        {members.map((m) => {
          const a = byMember.get(m.id);
          return (
            <div key={m.id} className="item">
              <span className="grow"><b>{m.name}</b><br /><span className="muted small">{m.jobTitle || "—"}{a?.note && ` · ${a.note}`}</span></span>
              {a ? <span className="num">{timeLabel(a.inAt)} → {timeLabel(a.outAt)}</span> : <span className="badge">Absent</span>}
            </div>
          );
        })}
      </div>
      <h2>Récapitulatif · {monthLabel(month)}</h2>
      <div className="card scroll-x">
        <table className="t">
          <thead><tr><th>Membre</th><th className="r">Jours</th><th className="r">Heures</th></tr></thead>
          <tbody>
            {members.map((m) => {
              const mine = monthRows.filter((r) => r.memberId === m.id);
              return <tr key={m.id}><td>{m.name}</td><td className="r num">{mine.length}</td><td className="r num">{mine.reduce((x, r) => x + hours(r), 0).toFixed(1)} h</td></tr>;
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

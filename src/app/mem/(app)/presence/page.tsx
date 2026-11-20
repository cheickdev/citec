import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/auth";
import { dayLabel, monthLabel, thisMonth, timeLabel, today } from "@/lib/util";
import CheckInCard from "@/components/CheckInCard";

export const metadata = { title: "Présence" };

export default async function MyPresence() {
  const m = await requireMember();
  const [att, rows] = await Promise.all([
    prisma.attendance.findUnique({ where: { memberId_day: { memberId: m.id, day: today() } } }),
    prisma.attendance.findMany({ where: { memberId: m.id, day: { startsWith: thisMonth() } }, orderBy: { day: "desc" } }),
  ]);
  const hours = rows.reduce((a, r) => a + (r.outAt ? (r.outAt.getTime() - r.inAt.getTime()) / 3600_000 : 0), 0);
  return (
    <>
      <h1>Présence</h1>
      <div style={{ maxWidth: 520, marginBottom: 16 }}><CheckInCard a={att} /></div>
      <h2>{monthLabel(thisMonth())} · {rows.length} jour(s) · {hours.toFixed(1)} h</h2>
      <div className="list" style={{ maxWidth: 520 }}>
        {rows.length === 0 && <div className="empty">Aucun pointage ce mois.</div>}
        {rows.map((r) => (
          <div key={r.id} className="item">
            <span className="grow"><b>{dayLabel(r.day)}</b>{r.note && <span className="muted small"> · {r.note}</span>}</span>
            <span className="num">{timeLabel(r.inAt)} → {timeLabel(r.outAt)}</span>
          </div>
        ))}
      </div>
    </>
  );
}

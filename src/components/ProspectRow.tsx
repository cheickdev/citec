import { P_STATUS } from "@/lib/prospects";
import { dayLabel, fcfa, today } from "@/lib/util";

export interface ProspectRowData {
  id: string; name: string; phone: string; quartier: string; gender: string; network: string; account: string;
  meeting: string; meetingDate: string; meetingTime: string; travelFee: number; status: string;
  project: { name: string; color: string } | null;
  member?: { name: string };
}

/** Une ligne de la liste des clients a contacter. */
export default function ProspectRow({ p, href }: { p: ProspectRowData; href: string }) {
  const upcoming = p.meetingDate && p.meetingDate >= today() && p.status !== "WON" && p.status !== "LOST";
  const isToday = p.meetingDate === today();
  return (
    <a href={href} className="item" style={{ textDecoration: "none", color: "inherit", borderLeft: `4px solid ${p.project?.color ?? "var(--line)"}` }}>
      <span className="grow">
        <b>{p.gender === "F" ? "👩 " : p.gender === "M" ? "👨 " : ""}{p.name}</b>
        {p.member && <span className="muted small"> · par {p.member.name}</span>}
        <br />
        <span className="muted small">
          {[p.phone, p.quartier, p.network && `${p.network}${p.account ? ` ${p.account}` : ""}`, p.project?.name].filter(Boolean).join(" · ") || "—"}
        </span>
        {p.meetingDate && (
          <>
            <br />
            <span className="small" style={{ color: isToday ? "var(--danger)" : upcoming ? "var(--accent-2)" : "var(--muted)", fontWeight: upcoming ? 650 : 400 }}>
              📅 {isToday ? "Aujourd'hui" : dayLabel(p.meetingDate)}{p.meetingTime && ` à ${p.meetingTime}`}{p.meeting && ` · ${p.meeting}`}
            </span>
          </>
        )}
      </span>
      <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
        <span className={`badge ${P_STATUS[p.status]?.cls ?? ""}`}>{P_STATUS[p.status]?.label ?? p.status}</span>
        {p.travelFee > 0 && <span className="small num muted">🚕 {fcfa(p.travelFee)}</span>}
      </span>
    </a>
  );
}

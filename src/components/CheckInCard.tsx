import { timeLabel } from "@/lib/util";
import Submit from "@/components/Submit";
import { checkIn, checkOut } from "@/app/mem/actions";

/** Pointage du jour : « J'arrive » puis « Je pars ». */
export default function CheckInCard({ a }: { a: { inAt: Date; outAt: Date | null } | null }) {
  return (
    <div className="card form">
      <h2 style={{ margin: 0 }}>🕘 Présence aujourd&apos;hui</h2>
      {!a ? (
        <form className="form" action={checkIn}>
          <input name="note" className="input" placeholder="Note (facultatif) : bureau, terrain, télétravail…" maxLength={120} />
          <Submit className="btn big block">👋 J&apos;arrive</Submit>
        </form>
      ) : !a.outAt ? (
        <form className="form" action={checkOut}>
          <p style={{ margin: 0 }}>Arrivé(e) à <b>{timeLabel(a.inAt)}</b>.</p>
          <Submit className="btn ghost big block" confirm="Enregistrer votre départ ?">🚪 Je pars</Submit>
        </form>
      ) : (
        <p style={{ margin: 0 }}>✅ Journée enregistrée : <b>{timeLabel(a.inAt)} → {timeLabel(a.outAt)}</b>. Bonne soirée !</p>
      )}
    </div>
  );
}

import ActionForm from "@/components/ActionForm";
import Submit from "@/components/Submit";
import type { AlertStatus } from "@/lib/alert";
import { linkTelegramAction, testAlert, unlinkTelegramAction } from "@/app/adm/actions";

/** Alertes a chaque nouveau client : Telegram (conseille) et/ou WhatsApp (CallMeBot). */
export default function AlertCard({ st, number }: { st: AlertStatus; number: string }) {
  const tgOn = st.telegramToken && !!st.telegramChat;
  const on = tgOn || st.whatsapp;
  return (
    <details className="card" style={{ marginBottom: 16 }} open={!on}>
      <summary>🔔 Alerte à chaque nouveau client · {on ? <span className="badge ok">Active</span> : <span className="badge warn">À activer</span>}</summary>
      <p className="muted small" style={{ marginTop: 0 }}>Les membres n&apos;ont rien à installer : c&apos;est le site qui vous envoie le message.</p>

      <h3>✈️ Telegram {tgOn ? <span className="badge ok">Relié à « {st.telegramChat} »</span> : st.telegramToken ? <span className="badge warn">Robot prêt, à relier</span> : <span className="badge">Pas encore réglé</span>}</h3>
      {!st.telegramToken && (
        <ol className="small" style={{ paddingLeft: 18, margin: "0 0 12px" }}>
          <li>Sur le téléphone de l&apos;admin, installez <b>Telegram</b> et ouvrez la discussion avec <b>@BotFather</b> (le robot officiel, avec la coche bleue).</li>
          <li>Envoyez <code>/newbot</code>, donnez un nom (ex. <i>Alertes CITEC</i>) puis un identifiant finissant par <i>bot</i> (ex. <i>citec_alertes_bot</i>).</li>
          <li>BotFather répond avec un <b>jeton</b> (ex. <code>123456789:AA…</code>). Gardez-le secret.</li>
          <li>Sur vercel.com → projet <b>citec</b> → <b>Settings → Environment Variables</b> : ajoutez <code>TELEGRAM_BOT_TOKEN</code> avec ce jeton, puis <b>Deployments → ⋯ → Redeploy</b>.</li>
        </ol>
      )}
      {st.telegramToken && !tgOn && (
        <ol className="small" style={{ paddingLeft: 18, margin: "0 0 12px" }}>
          <li>Dans Telegram, ouvrez votre robot (le lien <i>t.me/…</i> donné par BotFather) et touchez <b>Démarrer</b> (ou envoyez <code>/start</code>).</li>
          <li>Revenez ici et touchez <b>« Relier mon Telegram »</b>.</li>
        </ol>
      )}
      {st.telegramToken && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <ActionForm action={linkTelegramAction} className="form">
            <Submit className={tgOn ? "btn ghost sm" : "btn sm"}>{tgOn ? "🔁 Relier une autre discussion" : "🔗 Relier mon Telegram"}</Submit>
          </ActionForm>
          {tgOn && (
            <form action={unlinkTelegramAction}><Submit className="btn ghost sm" confirm="Ne plus envoyer les alertes sur Telegram ?">Délier</Submit></form>
          )}
        </div>
      )}

      <h3>💬 WhatsApp (CallMeBot) {st.whatsapp ? <span className="badge ok">Actif · +{number}</span> : <span className="badge">Non réglé</span>}</h3>
      {!st.whatsapp && <p className="muted small" style={{ marginTop: 0 }}>Facultatif : variable <code>CALLMEBOT_APIKEY</code> (et <code>ADMIN_WHATSAPP</code>) dans Vercel, quand le robot CallMeBot accepte de nouveaux numéros.</p>}

      {on && (
        <ActionForm action={testAlert} className="form">
          <Submit className="btn ghost sm">Envoyer un message d&apos;essai</Submit>
        </ActionForm>
      )}
    </details>
  );
}

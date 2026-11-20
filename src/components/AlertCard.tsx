import ActionForm from "@/components/ActionForm";
import Submit from "@/components/Submit";
import { testAlert } from "@/app/adm/actions";

/** Etat de l'alerte WhatsApp + reglage pas a pas + message d'essai. */
export default function AlertCard({ on, number }: { on: boolean; number: string }) {
  return (
    <details className="card" style={{ marginBottom: 16 }} open={!on}>
      <summary>📲 Alerte WhatsApp à chaque nouveau client · {on ? <span className="badge ok">Active</span> : <span className="badge warn">À activer</span>}</summary>
      <p className="muted small" style={{ marginTop: 0 }}>Chaque client ajouté par un membre est envoyé sur le WhatsApp <b>+{number}</b>.</p>
      {!on && (
        <ol className="small" style={{ paddingLeft: 18, margin: "0 0 12px" }}>
          <li>Sur le téléphone du <b>+{number}</b>, ouvrez <a href="https://www.callmebot.com/blog/free-api-whatsapp-messages/" target="_blank" rel="noopener noreferrer">callmebot.com → Free WhatsApp API</a>.</li>
          <li>Ajoutez le numéro de CallMeBot indiqué sur la page dans vos contacts, puis envoyez-lui sur WhatsApp le message exact demandé (du genre « I allow callmebot to send me messages »).</li>
          <li>Vous recevez une <b>apikey</b> (des chiffres).</li>
          <li>Sur vercel.com → projet <b>citec</b> → <b>Settings → Environment Variables</b> : ajoutez <code>CALLMEBOT_APIKEY</code> avec cette clé, puis <b>Deployments → ⋯ → Redeploy</b>.</li>
        </ol>
      )}
      <ActionForm action={testAlert} className="form">
        <Submit className="btn ghost sm">Envoyer un message d&apos;essai</Submit>
      </ActionForm>
    </details>
  );
}

import { CONTACT, SUBJECTS } from "@/lib/site";
import ActionForm from "@/components/ActionForm";
import Submit from "@/components/Submit";
import { sendContact } from "./actions";

export const metadata = { title: "Contactez-nous", description: "Écrivez à CITEC : une question sur Simple Pos, 2MT Shopping ou FreePhone, un partenariat, un recrutement." };

export default async function Contact({ searchParams }: { searchParams: Promise<{ sujet?: string }> }) {
  const { sujet = "" } = await searchParams;
  const wa = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent("Bonjour CITEC, ")}`;
  return (
    <>
      <section className="hero" style={{ paddingBottom: 0 }}>
        <span className="prompt">~/citec $ ./contact</span>
        <h1>Contactez-nous</h1>
        <p className="lead">Une question, un projet, un partenariat ? Écrivez-nous, nous répondons rapidement.</p>
      </section>
      <div className="grid c2" style={{ marginTop: 18, alignItems: "start" }}>
        <ActionForm action={sendContact} reset>
          <h2 style={{ marginBottom: 0 }}>Envoyer un message</h2>
          <div className="field"><label htmlFor="cn">Votre nom</label><input id="cn" name="name" className="input" required autoComplete="name" /></div>
          <div className="row">
            <div className="field"><label htmlFor="cp">Téléphone (WhatsApp)</label><input id="cp" name="phone" className="input" inputMode="tel" autoComplete="tel" /></div>
            <div className="field"><label htmlFor="ce">E-mail (facultatif)</label><input id="ce" name="email" type="email" className="input" autoComplete="email" /></div>
          </div>
          <div className="field">
            <label htmlFor="cs">Sujet</label>
            <select id="cs" name="subject" className="input" defaultValue={SUBJECTS.includes(sujet) ? sujet : "Simple Pos"}>
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="field"><label htmlFor="cm">Message</label><textarea id="cm" name="message" className="input" required style={{ minHeight: 130 }} /></div>
          {/* Piege a robots : invisible pour les humains */}
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }} />
          <Submit className="btn big">Envoyer</Submit>
        </ActionForm>
        <div className="grid" style={{ alignContent: "start" }}>
          <div className="card form">
            <h2 style={{ margin: 0 }}>💬 WhatsApp</h2>
            <p className="muted" style={{ margin: 0 }}>Le plus rapide : écrivez-nous directement.</p>
            <a className="btn" href={wa} target="_blank" rel="noopener">Écrire sur WhatsApp · {CONTACT.whatsappLabel}</a>
          </div>
          <div className="term">
            <div><span className="g">$</span> whereis citec</div>
            <div className="m">📍 {CONTACT.city}</div>
            <div className="m">🌐 citec.app</div>
          </div>
        </div>
      </div>
    </>
  );
}

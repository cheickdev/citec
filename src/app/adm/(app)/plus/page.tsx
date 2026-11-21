export const metadata = { title: "Plus" };

const LINKS = [
  ["/clients", "🤝", "Clients à contacter", "Prospects et rendez-vous des membres"],
  ["/messages", "✉️", "Messages du site", "Formulaire « Contactez-nous » de citec.app"],
  ["/projets", "🗂️", "Projets", "Sites suivis et clés des chiffres"],
  ["/annonces", "📣", "Annonces", "Messages aux membres"],
  ["/documents", "📁", "Documents", "Fichiers partagés"],
  ["/presence", "🕘", "Présence", "Arrivées et départs"],
  ["/paie", "🧾", "Paie", "Salaires et commissions"],
];

export default function Plus() {
  return (
    <>
      <h1>Plus</h1>
      <div className="list">
        {LINKS.map(([href, ico, label, sub]) => (
          <a key={href} href={href} className="item" style={{ textDecoration: "none", color: "inherit" }}>
            <span className="grow"><b>{ico} {label}</b><br /><span className="muted small">{sub}</span></span>
            <span aria-hidden>›</span>
          </a>
        ))}
      </div>
    </>
  );
}

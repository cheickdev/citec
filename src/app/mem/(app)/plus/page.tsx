export const metadata = { title: "Plus" };

const LINKS = [
  ["/annonces", "📣", "Annonces et documents", "Informations et fichiers de l'entreprise"],
  ["/paie", "🧾", "Ma paie", "Fiches de paie et commissions"],
  ["/compte", "👤", "Mon compte", "Mes informations, mon mot de passe"],
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

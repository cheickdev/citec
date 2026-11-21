import { CONTACT } from "@/lib/site";

export const metadata = { title: "À propos", description: "CITEC, entreprise de solutions numériques basée à Bamako." };

const VALUES = [
  ["🎯", "Utile d'abord", "Chaque fonction répond à un vrai problème de commerçant : les crédits oubliés, le stock, le temps perdu."],
  ["🧩", "Simple", "Si un outil a besoin d'une longue formation, il est trop compliqué. Nous visons « compris en 5 minutes »."],
  ["🤝", "Proche de nos clients", "Nous écoutons les retours et améliorons nos produits chaque semaine."],
  ["🔒", "Fiable", "Les données de chaque client sont protégées et séparées. Elles restent à lui."],
];

export default function About() {
  return (
    <>
      <section className="hero" style={{ paddingBottom: 0 }}>
        <span className="prompt">~/citec $ cat a-propos.md</span>
        <h1>À propos de CITEC</h1>
        <p className="lead">CITEC est une entreprise de solutions numériques basée à {CONTACT.city}. Nous créons et faisons grandir nos propres produits : Simple Pos, 2MT Shopping et FreePhone.</p>
      </section>
      <section className="section">
        <h2>Notre mission</h2>
        <div className="card">
          <p style={{ marginTop: 0 }}>Mettre dans la poche de chaque commerçant les outils qu&apos;utilisent les grandes entreprises : une caisse, un stock tenu à jour, des comptes clients clairs et une vitrine en ligne.</p>
          <p style={{ marginBottom: 0 }}>Le tout sur le téléphone, à un prix accessible, et capable de fonctionner quand le réseau coupe.</p>
        </div>
      </section>
      <section className="section">
        <h2>Nos valeurs</h2>
        <div className="grid c2">
          {VALUES.map(([ico, t, d]) => (
            <div key={t} className="card feat"><span className="ico" aria-hidden>{ico}</span><div><h3>{t}</h3><p>{d}</p></div></div>
          ))}
        </div>
      </section>
      <section className="section">
        <h2>Travailler avec nous</h2>
        <div className="card">
          <p style={{ marginTop: 0 }}>Vous êtes commerçant, partenaire, développeur ou agent commercial et vous souhaitez travailler avec CITEC ?</p>
          <a className="btn" href="/contact?sujet=Partenariat">Écrivez-nous</a>
        </div>
      </section>
    </>
  );
}

import { PRODUCTS } from "@/lib/site";
import ProductCard from "@/components/ProductCard";

const WHY = [
  ["📱", "Pensé pour le téléphone", "Tout se fait depuis un smartphone, sans ordinateur ni matériel coûteux."],
  ["📶", "Même quand internet coupe", "Nos outils continuent de fonctionner pendant les coupures de réseau."],
  ["💸", "Paiement Mobile Money", "Orange Money et paiement à la livraison : les moyens de paiement d'ici."],
  ["🗣️", "Simple et en français", "Des écrans clairs, une aide pas à pas et des vidéos pour bien démarrer."],
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <span className="prompt">~/citec $ ./presentation</span>
        <h1>Des outils numériques simples, pour les commerçants <span style={{ whiteSpace: "nowrap" }}>d&apos;Afrique<span className="cursor" aria-hidden /></span></h1>
        <p className="lead">CITEC conçoit des logiciels et des services en ligne qui font gagner du temps et de l&apos;argent : caisse et gestion de boutique, vente en ligne, vérification de téléphones.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a className="btn big" href="/produits">Découvrir nos produits</a>
          <a className="btn ghost big" href="/contact">Nous contacter</a>
        </div>
      </section>

      <section className="section">
        <h2>Nos produits</h2>
        <div className="grid c3">{PRODUCTS.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
      </section>

      <section className="section">
        <h2>Pourquoi CITEC</h2>
        <div className="grid c2">
          {WHY.map(([ico, t, d]) => (
            <div key={t} className="card feat"><span className="ico" aria-hidden>{ico}</span><div><h3>{t}</h3><p>{d}</p></div></div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="term">
          <div><span className="g">$</span> citec --contact</div>
          <div className="m">→ Un projet, une question, un partenariat ?</div>
          <div className="m">→ Écrivez-nous, nous répondons rapidement.</div>
          <div style={{ marginTop: 12 }}><a className="btn" href="/contact">Contactez-nous</a></div>
        </div>
      </section>
    </>
  );
}

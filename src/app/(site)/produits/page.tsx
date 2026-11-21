import { PRODUCTS } from "@/lib/site";
import ProductCard from "@/components/ProductCard";

export const metadata = { title: "Nos produits", description: "Simple Pos, 2MT Shopping et FreePhone : les produits de CITEC." };

export default function Products() {
  return (
    <>
      <section className="hero" style={{ paddingBottom: 0 }}>
        <span className="prompt">~/citec $ ls produits/</span>
        <h1>Nos produits</h1>
        <p className="lead">Trois produits, une même idée : des outils simples, utiles tout de suite, pensés pour le téléphone.</p>
      </section>
      <div className="grid" style={{ marginTop: 18 }}>{PRODUCTS.map((p) => <ProductCard key={p.slug} p={p} full />)}</div>
      <p className="muted" style={{ marginTop: 24 }}>Un besoin particulier pour votre activité ? <a href="/contact">Parlons-en</a>.</p>
    </>
  );
}

import type { Product } from "@/lib/site";

export default function ProductCard({ p, full = false }: { p: Product; full?: boolean }) {
  return (
    <div className="card prod" id={p.slug} style={{ ["--pc" as string]: p.color }}>
      <h3>{p.ico} {p.name}</h3>
      <span className="url">{p.urlLabel}</span>
      <p style={{ margin: 0 }}>{p.tagline}</p>
      {full && <p className="small muted" style={{ margin: 0 }}><b>Pour qui :</b> {p.forWho}</p>}
      {full && <ul>{p.points.map((x) => <li key={x}>{x}</li>)}</ul>}
      <div style={{ marginTop: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
        <a className="btn sm" href={p.url} target="_blank" rel="noopener">{p.cta} ↗</a>
        {!full && <a className="btn ghost sm" href={`/produits#${p.slug}`}>En savoir plus</a>}
      </div>
    </div>
  );
}

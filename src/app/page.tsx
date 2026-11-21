// citec.app (adresse principale) : les deux portes d'entree.
export default function Home() {
  return (
    <main className="login">
      <div className="card" style={{ maxWidth: 440, textAlign: "center" }}>
        <div className="brand-mark" style={{ width: 56, height: 56, fontSize: 20, margin: "0 auto 10px", borderRadius: 16 }}>CT</div>
        <h1 style={{ marginBottom: 4 }}>CITEC</h1>
        <p className="muted" style={{ marginTop: 0 }}>
          <a href="https://pos.2mt.shop">Simple Pos</a> · <a href="https://www.2mt.shop">2MT Shopping</a> · <a href="https://freephone.citec.app">FreePhone</a>
        </p>
        <div className="form" style={{ marginTop: 16 }}>
          <a className="btn big" href="https://member.citec.app">👤 Espace membre</a>
          <a className="btn ghost" href="https://admin.citec.app">🔐 Administration</a>
        </div>
      </div>
      <p className="muted small" style={{ position: "fixed", bottom: 12, left: 0, right: 0, textAlign: "center", margin: 0, fontFamily: "var(--mono)" }}>© {new Date().getFullYear()} CITEC · Tous droits réservés</p>
    </main>
  );
}

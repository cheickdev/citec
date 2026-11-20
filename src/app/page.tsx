// citec.app (adresse principale) : les deux portes d'entree.
export default function Home() {
  return (
    <main className="login">
      <div className="card" style={{ maxWidth: 440, textAlign: "center" }}>
        <div className="brand-mark" style={{ width: 56, height: 56, fontSize: 20, margin: "0 auto 10px", borderRadius: 16 }}>CT</div>
        <h1 style={{ marginBottom: 4 }}>CITEC</h1>
        <p className="muted" style={{ marginTop: 0 }}>Simple Pos · 2MT Shopping · FreePhone</p>
        <div className="form" style={{ marginTop: 16 }}>
          <a className="btn big" href="https://member.citec.app">👤 Espace membre</a>
          <a className="btn ghost" href="https://admin.citec.app">🔐 Administration</a>
        </div>
      </div>
    </main>
  );
}

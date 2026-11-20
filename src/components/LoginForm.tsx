"use client";

import { useActionState, useEffect } from "react";
import Submit from "@/components/Submit";

export default function LoginForm({ action, title, hint }: { action: (prev: string | null, f: FormData) => Promise<string | null>; title: string; hint: string }) {
  const [error, run] = useActionState(action, null);
  // « OK » : connecte -> on ouvre l'accueil (navigation complete, le cookie est pris en compte).
  useEffect(() => {
    if (error === "OK") window.location.assign("/");
  }, [error]);
  return (
    <main className="login">
      <form className="card form" action={run}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="brand-mark">CT</span>
          <div><b style={{ fontSize: 18 }}>CITEC</b><div className="muted small">{title}</div></div>
        </div>
        <div className="field">
          <label htmlFor="ph">Téléphone</label>
          <input id="ph" name="phone" className="input" inputMode="tel" autoComplete="username" required />
        </div>
        <div className="field">
          <label htmlFor="pw">Mot de passe</label>
          <input id="pw" name="password" type="password" className="input" autoComplete="current-password" required />
        </div>
        {error && error !== "OK" && <div className="error">{error}</div>}
        <Submit className="btn block big">Se connecter</Submit>
        <p className="muted small" style={{ margin: 0 }}>{hint}</p>
      </form>
    </main>
  );
}

"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", ico: "🏠", label: "Accueil" },
  { href: "/produits", ico: "🧩", label: "Nos produits" },
  { href: "/a-propos", ico: "🏢", label: "À propos" },
  { href: "/contact", ico: "✉️", label: "Contactez-nous" },
];
const SPACES = [
  { href: "https://member.citec.app", ico: "👤", label: "Espace membre" },
  { href: "https://admin.citec.app", ico: "🔐", label: "Administration" },
];

/** Vitrine citec.app : menu lateral (PC), menu deroulant (telephone). */
export default function SiteShell({ children }: { children: React.ReactNode }) {
  const path = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const on = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));
  const menu = (
    <>
      <nav className="nav">
        {NAV.map((i) => (
          <a key={i.href} href={i.href} className={on(i.href) ? "on" : ""}>
            <span aria-hidden>{i.ico}</span> {i.label}
          </a>
        ))}
      </nav>
      <div className="site-sep">Espaces</div>
      <nav className="nav">
        {SPACES.map((i) => (
          <a key={i.href} href={i.href}>
            <span aria-hidden>{i.ico}</span> {i.label}
          </a>
        ))}
      </nav>
    </>
  );
  return (
    <div className="shell site">
      <aside className="side">
        <a className="brand" href="/">
          <span className="brand-mark">CT</span>
          <span>CITEC<small>citec.app</small></span>
        </a>
        {menu}
        <div className="side-foot small muted" style={{ fontFamily: "var(--mono)" }}>© {new Date().getFullYear()} CITEC</div>
      </aside>
      <div style={{ minWidth: 0 }}>
        <header className="site-top">
          <a className="brand" href="/" style={{ padding: 0 }}><span className="brand-mark">CT</span><span>CITEC</span></a>
          <button type="button" className="btn ghost sm" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{open ? "✕ Fermer" : "☰ Menu"}</button>
        </header>
        {open && <div className="site-drop">{menu}</div>}
        <main className="main site-main">{children}</main>
        <footer className="site-foot">
          <span>© {new Date().getFullYear()} CITEC · Tous droits réservés</span>
          <span><a href="/produits">Nos produits</a> · <a href="/contact">Contact</a></span>
        </footer>
      </div>
    </div>
  );
}

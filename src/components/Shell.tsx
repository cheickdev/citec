"use client";

import { usePathname } from "next/navigation";

export interface NavItem { href: string; label: string; ico: string; mobile?: boolean; desktop?: boolean }

/** Menu lateral (PC) + barre du bas (telephone). Les adresses sont celles vues par le navigateur. */
export default function Shell({ items, space, user, logout, children }: { items: NavItem[]; space: string; user: string; logout: () => Promise<void>; children: React.ReactNode }) {
  const path = usePathname().replace(/^\/(adm|mem)(?=\/|$)/, "") || "/";
  const out = async () => {
    await logout();
    window.location.assign("/login");
  };
  const on = (h: string) => (h === "/" ? path === "/" : path === h || path.startsWith(h + "/"));
  return (
    <div className="shell">
      <aside className="side">
        <a className="brand" href="/">
          <span className="brand-mark">CT</span>
          <span>CITEC<small>{space}</small></span>
        </a>
        <nav className="nav">
          {items.filter((i) => i.desktop !== false).map((i) => (
            <a key={i.href} href={i.href} className={on(i.href) ? "on" : ""}>
              <span aria-hidden>{i.ico}</span> {i.label}
            </a>
          ))}
        </nav>
        <div className="side-foot">
          <div className="small"><b>{user}</b></div>
          <form action={out}><button className="btn ghost sm" style={{ marginTop: 8 }}>Se déconnecter</button></form>
        </div>
      </aside>
      <main className="main">
        <div className="topbar">
          <a className="brand" href="/" style={{ padding: 0 }}><span className="brand-mark">CT</span><span>CITEC<small>{space}</small></span></a>
          <form action={out}><button className="btn ghost sm">Sortir</button></form>
        </div>
        {children}
      </main>
      <nav className="bottom">
        {items.filter((i) => i.mobile !== false).slice(0, 5).map((i) => (
          <a key={i.href} href={i.href} className={on(i.href) ? "on" : ""}><span aria-hidden>{i.ico}</span>{i.label}</a>
        ))}
      </nav>
    </div>
  );
}

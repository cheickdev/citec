import { adminLogout, requireAdmin } from "@/lib/auth";
import Shell, { type NavItem } from "@/components/Shell";

export const dynamic = "force-dynamic";

const NAV: NavItem[] = [
  { href: "/", label: "Accueil", ico: "📊" },
  { href: "/taches", label: "Tâches", ico: "✅" },
  { href: "/membres", label: "Membres", ico: "👥" },
  { href: "/finances", label: "Finances", ico: "💰" },
  { href: "/plus", label: "Plus", ico: "☰", desktop: false },
  { href: "/clients", label: "Clients à contacter", ico: "🤝", mobile: false },
  { href: "/projets", label: "Projets", ico: "🗂️", mobile: false },
  { href: "/annonces", label: "Annonces", ico: "📣", mobile: false },
  { href: "/documents", label: "Documents", ico: "📁", mobile: false },
  { href: "/presence", label: "Présence", ico: "🕘", mobile: false },
  { href: "/paie", label: "Paie", ico: "🧾", mobile: false },
];

async function logout() {
  "use server";
  await adminLogout();
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const a = await requireAdmin();
  return (
    <Shell items={NAV} space="Administration" user={a.name} logout={logout}>
      {children}
    </Shell>
  );
}

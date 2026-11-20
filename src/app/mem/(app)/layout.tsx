import { memberLogout, requireMember } from "@/lib/auth";
import Shell, { type NavItem } from "@/components/Shell";

export const dynamic = "force-dynamic";

const NAV: NavItem[] = [
  { href: "/", label: "Accueil", ico: "🏠" },
  { href: "/taches", label: "Tâches", ico: "✅" },
  { href: "/clients", label: "Clients", ico: "🤝" },
  { href: "/presence", label: "Présence", ico: "🕘" },
  { href: "/plus", label: "Plus", ico: "☰", desktop: false },
  { href: "/annonces", label: "Annonces", ico: "📣", mobile: false },
  { href: "/paie", label: "Paie", ico: "🧾", mobile: false },
  { href: "/compte", label: "Mon compte", ico: "👤", mobile: false },
];

async function logout() {
  "use server";
  await memberLogout();
}

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const m = await requireMember();
  return <Shell items={NAV} space="Espace membre" user={m.name} logout={logout}>{children}</Shell>;
}

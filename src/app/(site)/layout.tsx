import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";

export const metadata: Metadata = {
  title: { default: "CITEC · Des outils numériques simples pour les commerçants", template: "%s · CITEC" },
  description: "CITEC conçoit Simple Pos (caisse et gestion de boutique), 2MT Shopping (boutique en ligne à Bamako) et FreePhone (vérification IMEI et déblocage).",
  robots: { index: true, follow: true },
  metadataBase: new URL("https://citec.app"),
  openGraph: { siteName: "CITEC", type: "website" },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}

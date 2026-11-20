import crypto from "crypto";
import { prisma } from "@/lib/db";

export const newKey = () => crypto.randomBytes(24).toString("hex");

// Projets de depart (crees une seule fois).
const DEFAULTS = [
  { slug: "simple-pos", name: "Simple Pos", url: "https://pos.2mt.shop", color: "#0f766e", kind: "simplepos", summary: "Logiciel de caisse et de gestion de boutique (abonnements).", statsUrl: "https://pos.2mt.shop/api/citec/stats", order: 1 },
  { slug: "2mt-shopping", name: "2MT Shopping", url: "https://www.2mt.shop", color: "#e11d48", kind: "2mt", summary: "Boutique en ligne et place de marché des vendeurs.", statsUrl: "https://www.2mt.shop/api/citec/stats", order: 2 },
  { slug: "freephone", name: "FreePhone", url: "https://freephone.citec.app", color: "#7c3aed", kind: "freephone", summary: "Vérification IMEI et déblocage de téléphones.", statsUrl: "https://freephone.citec.app/api/citec/stats", order: 3 },
];

export async function ensureProjects() {
  if (await prisma.project.count()) return;
  for (const p of DEFAULTS) await prisma.project.create({ data: { ...p, statsKey: newKey() } });
}

export async function projectOptions() {
  return prisma.project.findMany({ where: { active: true }, orderBy: [{ order: "asc" }, { name: "asc" }], select: { id: true, name: true, color: true, slug: true } });
}

import { prisma } from "@/lib/db";

/** Projets du membre (pour ses annonces, documents et taches de projet). */
export async function myProjectIds(memberId: string): Promise<string[]> {
  return (await prisma.projectMember.findMany({ where: { memberId }, select: { projectId: true } })).map((p) => p.projectId);
}
/** Annonces et documents visibles : toute l'entreprise + ses projets. */
export const visibleTo = (projects: string[]) => ({ OR: [{ projectId: null }, { projectId: { in: projects } }] });

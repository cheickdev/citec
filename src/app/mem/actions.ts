"use server";
// Actions d'un membre : uniquement sur SES taches et SES donnees.
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { hashSecret, refreshMemberCookie, requireMember, verifySecret } from "@/lib/auth";
import { str, today } from "@/lib/util";

const back = () => revalidatePath("/", "layout");

/** Tache visible par le membre : confiee a lui, ou d'un de ses projets. */
async function myTask(memberId: string, taskId: string) {
  const projects = (await prisma.projectMember.findMany({ where: { memberId }, select: { projectId: true } })).map((p) => p.projectId);
  return prisma.task.findFirst({ where: { id: taskId, OR: [{ assigneeId: memberId }, { projectId: { in: projects } }] } });
}

export async function setTaskStatus(f: FormData) {
  const m = await requireMember();
  const t = await myTask(m.id, str(f.get("id")));
  const status = str(f.get("status"));
  if (!t || !["TODO", "DOING", "DONE"].includes(status)) return;
  // Une tache libre d'un projet : la commencer = la prendre pour soi
  await prisma.task.update({ where: { id: t.id }, data: { status, doneAt: status === "DONE" ? t.doneAt ?? new Date() : null, ...(!t.assigneeId && status !== "TODO" ? { assigneeId: m.id } : {}) } });
  back();
}

export async function commentTask(f: FormData) {
  const m = await requireMember();
  const t = await myTask(m.id, str(f.get("id")));
  const body = str(f.get("body"));
  if (!t || !body) return;
  await prisma.taskComment.create({ data: { taskId: t.id, memberId: m.id, author: m.name, body: body.slice(0, 2000) } });
  back();
}

export async function checkIn(f: FormData) {
  const m = await requireMember();
  await prisma.attendance.upsert({ where: { memberId_day: { memberId: m.id, day: today() } }, create: { memberId: m.id, day: today(), inAt: new Date(), note: str(f.get("note")).slice(0, 120) }, update: {} });
  back();
}

export async function checkOut() {
  const m = await requireMember();
  await prisma.attendance.updateMany({ where: { memberId: m.id, day: today(), outAt: null }, data: { outAt: new Date() } });
  back();
}

export async function changePassword(_: { error?: string; ok?: string } | null, f: FormData): Promise<{ error?: string; ok?: string }> {
  const m = await requireMember();
  if (!verifySecret(str(f.get("current")), m.passHash)) return { error: "Mot de passe actuel incorrect." };
  const next = str(f.get("next"));
  if (next.length < 6) return { error: "Nouveau mot de passe : 6 caractères au moins." };
  const u = await prisma.member.update({ where: { id: m.id }, data: { passHash: hashSecret(next) } });
  await refreshMemberCookie(u);
  return { ok: "Mot de passe changé ✓" };
}

"use server";
// Actions d'un membre : uniquement sur SES taches et SES donnees.
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { hashSecret, refreshMemberCookie, requireMember, verifySecret } from "@/lib/auth";
import { str, today } from "@/lib/util";
import { P_STATUS, prospectData } from "@/lib/prospects";
import { after } from "next/server";
import { alertReady, sendAdminAlert } from "@/lib/alert";
import { dayLabel, fcfa } from "@/lib/util";

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

// ---- Clients a contacter (seulement les siens) ------------------------------------

type PState = { error?: string; ok?: string; go?: string } | null;

export async function saveProspect(_: PState, f: FormData): Promise<PState> {
  const m = await requireMember();
  const d = prospectData(f);
  if (d.name.length < 2) return { error: "Indiquez le nom du client." };
  const id = str(f.get("id"));
  if (id) {
    const r = await prisma.prospect.updateMany({ where: { id, memberId: m.id }, data: d });
    if (!r.count) return { error: "Client introuvable." };
    back();
    return { go: "/clients" };
  }
  const p = await prisma.prospect.create({ data: { ...d, memberId: m.id }, include: { project: { select: { name: true } } } });
  // Alerte WhatsApp a l'admin, envoyee apres la reponse (le membre n'attend pas).
  if (await alertReady()) {
    const opt = (cond: unknown, line: string) => (cond ? [line] : []);
    const text = [
      `🤝 CITEC : nouveau client à contacter`,
      `Ajouté par : ${m.name}`,
      ``,
      `👤 ${p.name}${p.gender === "F" ? " (femme)" : p.gender === "M" ? " (homme)" : ""}`,
      ...opt(p.phone, `📞 ${p.phone}`),
      ...opt(p.quartier, `📍 ${p.quartier}`),
      ...opt(p.network || p.account, `📱 ${[p.network, p.account].filter(Boolean).join(" · ")}`),
      ...opt(p.meeting || p.meetingDate, `📅 RDV : ${[p.meeting, p.meetingDate && dayLabel(p.meetingDate), p.meetingTime && `à ${p.meetingTime}`].filter(Boolean).join(" · ")}`),
      ...opt(p.travelFee > 0, `🚕 Frais de déplacement : ${fcfa(p.travelFee)}`),
      ...opt(p.project, `🗂️ ${p.project?.name}`),
      `Statut : ${P_STATUS[p.status]?.label ?? p.status}`,
      ``,
      `→ https://admin.citec.app/clients/${p.id}`,
    ].join("\n");
    after(() => sendAdminAlert(text).then(() => undefined));
  }
  back();
  return { ok: `✓ ${d.name} ajouté(e).` };
}

export async function deleteProspect(_: PState, f: FormData): Promise<PState> {
  const m = await requireMember();
  await prisma.prospect.deleteMany({ where: { id: str(f.get("id")), memberId: m.id } });
  back();
  return { go: "/clients" };
}

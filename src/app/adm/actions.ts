"use server";
// Actions de l'administration. Chaque action verifie d'abord que c'est bien l'admin.
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { digits, hashSecret, requireAdmin } from "@/lib/auth";
import { newKey } from "@/lib/projects";
import { deleteFile, saveFile } from "@/lib/storage";
import { parseAmount, str, today } from "@/lib/util";

// Rafraichit toutes les pages (les adresses vues passent par l'aiguillage admin./member.).
const back = (_p?: string) => revalidatePath("/", "layout");
const projectOrNull = (v: string) => (v ? v : null);

// ---- Membres ---------------------------------------------------------------------
export type FormState = { error?: string; ok?: string; go?: string } | null;

export async function createMember(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const name = str(f.get("name"));
  const phone = digits(str(f.get("phone")));
  const password = str(f.get("password"));
  if (name.length < 2) return { error: "Indiquez le nom." };
  if (phone.length < 8) return { error: "Numéro de téléphone invalide (8 chiffres au moins)." };
  if (password.length < 6) return { error: "Mot de passe : 6 caractères au moins." };
  if (await prisma.member.findUnique({ where: { phone } })) return { error: "Ce numéro est déjà utilisé par un membre." };
  const projects = f.getAll("projects").map(String).filter(Boolean);
  const m = await prisma.member.create({
    data: {
      name,
      phone,
      email: str(f.get("email")),
      jobTitle: str(f.get("jobTitle")),
      role: f.get("role") === "ADMIN" ? "ADMIN" : "MEMBER",
      salary: parseAmount(f.get("salary")),
      passHash: hashSecret(password),
      projects: { create: projects.map((projectId) => ({ projectId })) },
    },
  });
  back("/membres");
  return { go: `/membres/${m.id}?cree=1` };
}

export async function updateMember(f: FormData) {
  await requireAdmin();
  const id = str(f.get("id"));
  const projects = f.getAll("projects").map(String).filter(Boolean);
  await prisma.$transaction([
    prisma.member.update({
      where: { id },
      data: {
        name: str(f.get("name")) || undefined,
        email: str(f.get("email")),
        jobTitle: str(f.get("jobTitle")),
        role: f.get("role") === "ADMIN" ? "ADMIN" : "MEMBER",
        salary: parseAmount(f.get("salary")),
      },
    }),
    prisma.projectMember.deleteMany({ where: { memberId: id } }),
    prisma.projectMember.createMany({ data: projects.map((projectId) => ({ projectId, memberId: id })) }),
  ]);
  back("/membres");
}

export async function resetPassword(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const password = str(f.get("password"));
  if (password.length < 6) return { error: "6 caractères au moins." };
  await prisma.member.update({ where: { id: str(f.get("id")) }, data: { passHash: hashSecret(password) } });
  return { ok: `Nouveau mot de passe enregistré : ${password}` };
}

export async function toggleMember(f: FormData) {
  await requireAdmin();
  const id = str(f.get("id"));
  const m = await prisma.member.findUnique({ where: { id } });
  if (m) await prisma.member.update({ where: { id }, data: { active: !m.active } });
  back("/membres");
}

// ---- Projets ---------------------------------------------------------------------
export async function saveProject(f: FormData) {
  await requireAdmin();
  const id = str(f.get("id"));
  const name = str(f.get("name"));
  if (!name) return;
  const data = {
    name,
    url: str(f.get("url")),
    color: /^#[0-9a-f]{6}$/i.test(str(f.get("color"))) ? str(f.get("color")) : "#1d4ed8",
    summary: str(f.get("summary")),
    statsUrl: str(f.get("statsUrl")),
    kind: ["simplepos", "2mt", "freephone"].includes(str(f.get("kind"))) ? str(f.get("kind")) : "other",
    active: f.get("active") !== "off",
  };
  if (id) await prisma.project.update({ where: { id }, data });
  else {
    const base = name.normalize("NFD").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "projet";
    let slug = base;
    for (let i = 2; await prisma.project.findUnique({ where: { slug } }); i++) slug = `${base}-${i}`;
    await prisma.project.create({ data: { ...data, slug, statsKey: newKey(), order: 10 } });
  }
  back("/projets");
}

export async function newProjectKey(f: FormData) {
  await requireAdmin();
  await prisma.project.update({ where: { id: str(f.get("id")) }, data: { statsKey: newKey() } });
  back("/projets");
}

// ---- Taches ----------------------------------------------------------------------
export async function createTask(f: FormData) {
  const a = await requireAdmin();
  const title = str(f.get("title"));
  if (!title) return;
  await prisma.task.create({
    data: {
      title,
      description: str(f.get("description")),
      projectId: projectOrNull(str(f.get("projectId"))),
      assigneeId: str(f.get("assigneeId")) || null,
      priority: ["LOW", "NORMAL", "HIGH"].includes(str(f.get("priority"))) ? str(f.get("priority")) : "NORMAL",
      dueDate: /^\d{4}-\d{2}-\d{2}$/.test(str(f.get("dueDate"))) ? str(f.get("dueDate")) : "",
      createdBy: a.name,
    },
  });
  back("/taches");
}

export async function updateTask(f: FormData) {
  await requireAdmin();
  const id = str(f.get("id"));
  const status = str(f.get("status"));
  const t = await prisma.task.findUnique({ where: { id } });
  if (!t) return;
  await prisma.task.update({
    where: { id },
    data: {
      title: str(f.get("title")) || t.title,
      description: f.has("description") ? str(f.get("description")) : t.description,
      projectId: f.has("projectId") ? projectOrNull(str(f.get("projectId"))) : t.projectId,
      assigneeId: f.has("assigneeId") ? str(f.get("assigneeId")) || null : t.assigneeId,
      priority: ["LOW", "NORMAL", "HIGH"].includes(str(f.get("priority"))) ? str(f.get("priority")) : t.priority,
      dueDate: f.has("dueDate") ? (/^\d{4}-\d{2}-\d{2}$/.test(str(f.get("dueDate"))) ? str(f.get("dueDate")) : "") : t.dueDate,
      ...(["TODO", "DOING", "DONE"].includes(status) ? { status, doneAt: status === "DONE" ? t.doneAt ?? new Date() : null } : {}),
    },
  });
  back("/taches");
}

export async function deleteTask(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  await prisma.task.delete({ where: { id: str(f.get("id")) } }).catch(() => null);
  back("/taches");
  return { go: "/taches" };
}

export async function commentTask(f: FormData) {
  const a = await requireAdmin();
  const body = str(f.get("body"));
  if (!body) return;
  await prisma.taskComment.create({ data: { taskId: str(f.get("id")), author: `${a.name} (direction)`, body } });
  back("/taches");
}

// ---- Annonces et documents ---------------------------------------------------------
export async function createPost(f: FormData) {
  await requireAdmin();
  const title = str(f.get("title"));
  const body = str(f.get("body"));
  if (!title || !body) return;
  await prisma.announcement.create({ data: { title, body, projectId: projectOrNull(str(f.get("projectId"))), pinned: f.get("pinned") === "on" } });
  back("/annonces");
}
export async function deletePost(f: FormData) {
  await requireAdmin();
  await prisma.announcement.delete({ where: { id: str(f.get("id")) } }).catch(() => null);
  back("/annonces");
}
export async function togglePin(f: FormData) {
  await requireAdmin();
  const p = await prisma.announcement.findUnique({ where: { id: str(f.get("id")) } });
  if (p) await prisma.announcement.update({ where: { id: p.id }, data: { pinned: !p.pinned } });
  back("/annonces");
}

export async function uploadDocument(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const file = f.get("file");
  if (!(file instanceof File) || !file.size) return { error: "Choisissez un fichier." };
  if (file.size > 10_000_000) return { error: "Fichier trop lourd (10 Mo au plus)." };
  const url = await saveFile(file.name, Buffer.from(await file.arrayBuffer()), file.type);
  await prisma.document.create({ data: { title: str(f.get("title")) || file.name, url, fileName: file.name, size: file.size, projectId: projectOrNull(str(f.get("projectId"))) } });
  back("/documents");
  return { ok: "Document ajouté." };
}
export async function deleteDocument(f: FormData) {
  await requireAdmin();
  const d = await prisma.document.findUnique({ where: { id: str(f.get("id")) } });
  if (!d) return;
  await prisma.document.delete({ where: { id: d.id } });
  await deleteFile(d.url);
  back("/documents");
}

// ---- Paie ------------------------------------------------------------------------
/** Prepare les fiches du mois (salaire de base de chaque membre actif), sans toucher aux fiches existantes. */
export async function preparePayroll(f: FormData) {
  await requireAdmin();
  const month = /^\d{4}-\d{2}$/.test(str(f.get("month"))) ? str(f.get("month")) : today().slice(0, 7);
  const members = await prisma.member.findMany({ where: { active: true } });
  for (const m of members) {
    await prisma.payslip.upsert({ where: { memberId_month: { memberId: m.id, month } }, create: { memberId: m.id, month, base: m.salary }, update: {} });
  }
  back("/paie");
}

export async function savePayslip(f: FormData) {
  await requireAdmin();
  const id = str(f.get("id"));
  const p = await prisma.payslip.findUnique({ where: { id } });
  if (!p || p.paidAt) return;
  await prisma.payslip.update({
    where: { id },
    data: { base: parseAmount(f.get("base")), commission: parseAmount(f.get("commission")), bonus: parseAmount(f.get("bonus")), deduction: parseAmount(f.get("deduction")), note: str(f.get("note")) },
  });
  back("/paie");
}

/** Marque la fiche payee : la depense « Salaires » est ajoutee aux finances. */
export async function payPayslip(f: FormData) {
  await requireAdmin();
  let p = await prisma.payslip.findUnique({ where: { id: str(f.get("id")) }, include: { member: true } });
  if (!p || p.paidAt) return;
  // Montants tapes juste avant « Payé » : enregistres d'abord
  if (f.has("base"))
    p = await prisma.payslip.update({
      where: { id: p.id },
      data: { base: parseAmount(f.get("base")), commission: parseAmount(f.get("commission")), bonus: parseAmount(f.get("bonus")), deduction: parseAmount(f.get("deduction")), note: str(f.get("note")) },
      include: { member: true },
    });
  const total = p.base + p.commission + p.bonus - p.deduction;
  await prisma.$transaction([
    prisma.payslip.update({ where: { id: p.id }, data: { paidAt: new Date() } }),
    prisma.finEntry.create({ data: { kind: "EXPENSE", amount: total, category: "Salaires", label: `Paie ${p.month} · ${p.member.name}`, day: today(), source: "PAYROLL", autoKey: `pay:${p.id}` } }),
  ]);
  back("/paie");
}

export async function unpayPayslip(f: FormData) {
  await requireAdmin();
  const id = str(f.get("id"));
  await prisma.$transaction([prisma.payslip.update({ where: { id }, data: { paidAt: null } }), prisma.finEntry.deleteMany({ where: { autoKey: `pay:${id}` } })]);
  back("/paie");
}

// ---- Finances --------------------------------------------------------------------
export async function addFinEntry(f: FormData) {
  await requireAdmin();
  const amount = parseAmount(f.get("amount"));
  if (amount <= 0) return;
  await prisma.finEntry.create({
    data: {
      kind: f.get("kind") === "INCOME" ? "INCOME" : "EXPENSE",
      amount,
      projectId: projectOrNull(str(f.get("projectId"))),
      category: str(f.get("category")),
      label: str(f.get("label")),
      day: /^\d{4}-\d{2}-\d{2}$/.test(str(f.get("day"))) ? str(f.get("day")) : today(),
    },
  });
  back("/finances");
}
export async function deleteFinEntry(f: FormData) {
  await requireAdmin();
  await prisma.finEntry.deleteMany({ where: { id: str(f.get("id")), source: "MANUAL" } });
  back("/finances");
}

// ---- Alerte WhatsApp : message d'essai -------------------------------------------
export async function testAlert(_: FormState): Promise<FormState> {
  await requireAdmin();
  const { alertConfigured, sendAdminAlert } = await import("@/lib/alert");
  if (!alertConfigured()) return { error: "La clé CALLMEBOT_APIKEY n'est pas encore dans Vercel." };
  const r = await sendAdminAlert("✅ CITEC : les alertes WhatsApp fonctionnent. Vous serez prévenu à chaque nouveau client à contacter.");
  return r.ok ? { ok: "Message d'essai envoyé ✓ Regardez votre WhatsApp." } : { error: `Échec : ${r.info}` };
}

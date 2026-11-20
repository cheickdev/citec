// Connexion : cookie signe (HMAC) « id.signature ». La signature depend du mot de passe :
// le changer deconnecte partout.
//  - admin.citec.app  : le patron (ADMIN_PHONE + ADMIN_PASSWORD, variables Vercel) ou un membre ADMIN.
//  - member.citec.app : chaque membre (telephone + mot de passe donne par l'admin).
import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

const ADMIN_COOKIE = "citec_admin";
const MEMBER_COOKIE = "citec_member";
const ROOT = "root";

export function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET manquant");
  return "dev-insecure-secret";
}
export function hashSecret(pw: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  return salt + ":" + crypto.scryptSync(pw, salt, 32).toString("hex");
}
export function verifySecret(pw: string, stored: string): boolean {
  const [salt, h] = stored.split(":");
  if (!salt || !h) return false;
  return safeEqual(crypto.scryptSync(pw, salt, 32).toString("hex"), h);
}
export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}
const sign = (scope: string, id: string, pass: string) => crypto.createHmac("sha256", secret()).update(`${scope}:${id}:${pass}`).digest("hex");
const rootPass = () => process.env.ADMIN_PASSWORD ?? "";
export const digits = (s: string) => s.replace(/\D/g, "");

const cookieOpts = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 };

// ---- Espace admin ----------------------------------------------------------------
export interface AdminUser { id: string; name: string; root: boolean }

/** Verifie l'identifiant du patron (variables) ou d'un membre ADMIN. */
export async function adminLogin(phone: string, password: string): Promise<boolean> {
  const p = digits(phone);
  const rp = digits(process.env.ADMIN_PHONE ?? "");
  if (rootPass().length >= 8 && rp && p.endsWith(rp.slice(-8)) && safeEqual(crypto.createHash("sha256").update(password).digest("hex"), crypto.createHash("sha256").update(rootPass()).digest("hex"))) {
    (await cookies()).set(ADMIN_COOKIE, `${ROOT}.${sign("admin", ROOT, rootPass())}`, cookieOpts);
    return true;
  }
  const m = await prisma.member.findFirst({ where: { phone: p, role: "ADMIN", active: true } });
  if (!m || !verifySecret(password, m.passHash)) return false;
  (await cookies()).set(ADMIN_COOKIE, `${m.id}.${sign("admin", m.id, m.passHash)}`, cookieOpts);
  return true;
}

export async function getAdmin(): Promise<AdminUser | null> {
  const [id, sig] = ((await cookies()).get(ADMIN_COOKIE)?.value ?? "").split(".");
  if (!id || !sig) return null;
  if (id === ROOT) return rootPass().length >= 8 && safeEqual(sig, sign("admin", ROOT, rootPass())) ? { id: ROOT, name: process.env.ADMIN_NAME || "Patron", root: true } : null;
  const m = await prisma.member.findUnique({ where: { id } });
  if (!m || !m.active || m.role !== "ADMIN" || !safeEqual(sig, sign("admin", m.id, m.passHash))) return null;
  return { id: m.id, name: m.name, root: false };
}
export async function requireAdmin(): Promise<AdminUser> {
  const a = await getAdmin();
  if (!a) redirect("/login");
  return a;
}
export async function adminLogout() {
  (await cookies()).delete(ADMIN_COOKIE);
}

// ---- Espace membre ---------------------------------------------------------------
export async function memberLogin(phone: string, password: string): Promise<boolean> {
  const m = await prisma.member.findFirst({ where: { phone: digits(phone), active: true } });
  if (!m || !verifySecret(password, m.passHash)) return false;
  (await cookies()).set(MEMBER_COOKIE, `${m.id}.${sign("member", m.id, m.passHash)}`, cookieOpts);
  return true;
}
export async function getMember() {
  const [id, sig] = ((await cookies()).get(MEMBER_COOKIE)?.value ?? "").split(".");
  if (!id || !sig) return null;
  const m = await prisma.member.findUnique({ where: { id } });
  if (!m || !m.active || !safeEqual(sig, sign("member", m.id, m.passHash))) return null;
  return m;
}
export async function requireMember() {
  const m = await getMember();
  if (!m) redirect("/login");
  return m;
}
export async function memberLogout() {
  (await cookies()).delete(MEMBER_COOKIE);
}
/** Apres changement de mot de passe : nouveau cookie (l'ancien ne vaut plus). */
export async function refreshMemberCookie(m: { id: string; passHash: string }) {
  (await cookies()).set(MEMBER_COOKIE, `${m.id}.${sign("member", m.id, m.passHash)}`, cookieOpts);
}

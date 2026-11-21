"use server";
// Formulaire public « Contactez-nous » : enregistre le message et previent l'admin (Telegram / WhatsApp).
import { after } from "next/server";
import { prisma } from "@/lib/db";
import { alertReady, sendAdminAlert } from "@/lib/alert";
import { str } from "@/lib/util";
import { SUBJECTS } from "@/lib/site";

type S = { error?: string; ok?: string } | null;

export async function sendContact(_: S, f: FormData): Promise<S> {
  if (str(f.get("website"))) return { ok: "Merci, votre message a bien été envoyé." }; // piege a robots
  const name = str(f.get("name")).slice(0, 80);
  const phone = str(f.get("phone")).slice(0, 30);
  const email = str(f.get("email")).slice(0, 120);
  const subject = SUBJECTS.includes(str(f.get("subject"))) ? str(f.get("subject")) : "Autre";
  const message = str(f.get("message")).slice(0, 3000);
  if (name.length < 2) return { error: "Indiquez votre nom." };
  if (phone.replace(/\D/g, "").length < 8 && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Laissez un numéro de téléphone (WhatsApp) ou un e-mail pour que nous puissions vous répondre." };
  if (message.length < 5) return { error: "Écrivez votre message." };
  // Pas plus de 3 messages par heure depuis le meme contact
  const since = new Date(Date.now() - 3600_000);
  const recent = await prisma.contactMessage.count({ where: { createdAt: { gte: since }, OR: [...(phone ? [{ phone }] : []), ...(email ? [{ email }] : [])] } });
  if (recent >= 3) return { error: "Vous nous avez déjà écrit plusieurs fois : nous vous répondons très vite." };
  const m = await prisma.contactMessage.create({ data: { name, phone, email, subject, message } });
  if (await alertReady()) {
    const text = [`✉️ CITEC : nouveau message (citec.app)`, ``, `👤 ${name}`, ...(phone ? [`📞 ${phone}`] : []), ...(email ? [`📧 ${email}`] : []), `🏷️ ${subject}`, ``, message.slice(0, 1200), ``, `→ https://admin.citec.app/messages#${m.id}`].join("\n");
    after(() => sendAdminAlert(text).then(() => undefined));
  }
  return { ok: "Merci, votre message a bien été envoyé. Nous vous répondons au plus vite." };
}

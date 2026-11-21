// Alertes a l'admin CITEC (nouveau client a contacter...).
// 1) Telegram (gratuit, conseille) : TELEGRAM_BOT_TOKEN (robot cree avec @BotFather)
//    + la discussion reliee depuis l'admin (bouton « Relier mon Telegram »).
// 2) WhatsApp via CallMeBot : CALLMEBOT_APIKEY (+ ADMIN_WHATSAPP, numero de l'admin).
// Les membres n'ont rien a installer : c'est le site qui envoie.
import { prisma } from "@/lib/db";

export const adminWhatsapp = () => (process.env.ADMIN_WHATSAPP || "22376842672").replace(/\D/g, "");
const tgToken = () => process.env.TELEGRAM_BOT_TOKEN ?? "";
const tgApi = (method: string) => `${process.env.TELEGRAM_API_URL || "https://api.telegram.org"}/bot${tgToken()}/${method}`;
const TG_CHAT = "telegram_chat"; // { id, title }

export async function telegramChat(): Promise<{ id: string; title: string } | null> {
  const s = await prisma.setting.findUnique({ where: { key: TG_CHAT } });
  try {
    return s ? (JSON.parse(s.value) as { id: string; title: string }) : null;
  } catch {
    return null;
  }
}

export interface AlertStatus { telegramToken: boolean; telegramChat: string | null; whatsapp: boolean }
export async function alertStatus(): Promise<AlertStatus> {
  return { telegramToken: !!tgToken(), telegramChat: tgToken() ? (await telegramChat())?.title ?? null : null, whatsapp: !!process.env.CALLMEBOT_APIKEY };
}

/** Au moins un moyen d'alerte est pret ? */
export async function alertReady(): Promise<boolean> {
  return !!process.env.CALLMEBOT_APIKEY || (!!tgToken() && !!(await telegramChat()));
}

/** Telegram : cherche la derniere discussion qui a ecrit au robot (/start) et la relie. */
export async function linkTelegram(): Promise<{ ok: boolean; info: string }> {
  if (!tgToken()) return { ok: false, info: "La variable TELEGRAM_BOT_TOKEN n'est pas encore dans Vercel." };
  try {
    const r = await fetch(tgApi("getUpdates"), { cache: "no-store", signal: AbortSignal.timeout(15_000) });
    const j = await r.json();
    if (!j.ok) return { ok: false, info: j.description === "Unauthorized" ? "Le jeton du robot est faux (TELEGRAM_BOT_TOKEN)." : `Telegram : ${j.description ?? r.status}` };
    const msgs = (j.result as { message?: { chat: { id: number; title?: string; first_name?: string; last_name?: string; username?: string } } ; my_chat_member?: { chat: { id: number; title?: string } } }[])
      .map((u) => u.message?.chat ?? u.my_chat_member?.chat)
      .filter(Boolean) as { id: number; title?: string; first_name?: string; last_name?: string; username?: string }[];
    const chat = msgs.at(-1);
    if (!chat) return { ok: false, info: "Aucun message reçu : ouvrez votre robot dans Telegram, envoyez /start, puis réessayez." };
    const title = chat.title || [chat.first_name, chat.last_name].filter(Boolean).join(" ") || chat.username || String(chat.id);
    await prisma.setting.upsert({ where: { key: TG_CHAT }, create: { key: TG_CHAT, value: JSON.stringify({ id: String(chat.id), title }) }, update: { value: JSON.stringify({ id: String(chat.id), title }) } });
    return { ok: true, info: title };
  } catch (e) {
    return { ok: false, info: (e as Error).message };
  }
}

export async function unlinkTelegram() {
  await prisma.setting.deleteMany({ where: { key: TG_CHAT } });
}

async function sendTelegram(text: string): Promise<{ ok: boolean; info: string } | null> {
  if (!tgToken()) return null;
  const chat = await telegramChat();
  if (!chat) return null;
  try {
    const r = await fetch(tgApi("sendMessage"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat.id, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(15_000),
    });
    const j = await r.json().catch(() => ({}));
    return { ok: !!j.ok, info: j.ok ? "Telegram ✓" : `Telegram : ${j.description ?? r.status}` };
  } catch (e) {
    return { ok: false, info: `Telegram : ${(e as Error).message}` };
  }
}

async function sendWhatsapp(text: string): Promise<{ ok: boolean; info: string } | null> {
  const key = process.env.CALLMEBOT_APIKEY;
  if (!key) return null;
  const url = `${process.env.CALLMEBOT_URL || "https://api.callmebot.com/whatsapp.php"}?phone=%2B${adminWhatsapp()}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(key)}`;
  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(15_000) });
    const body = (await res.text()).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200);
    const ok = res.ok && !/error|invalid|not/i.test(body);
    return { ok, info: ok ? "WhatsApp ✓" : `WhatsApp : ${body || res.status}` };
  } catch (e) {
    return { ok: false, info: `WhatsApp : ${(e as Error).message}` };
  }
}

/** Envoie l'alerte par tous les moyens regles. ok = au moins un envoi reussi. */
export async function sendAdminAlert(text: string): Promise<{ ok: boolean; info: string }> {
  const results = (await Promise.all([sendTelegram(text), sendWhatsapp(text)])).filter(Boolean) as { ok: boolean; info: string }[];
  if (!results.length) return { ok: false, info: "Aucune alerte n'est encore réglée." };
  return { ok: results.some((r) => r.ok), info: results.map((r) => r.info).join(" · ") };
}

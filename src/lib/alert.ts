// Alertes WhatsApp a l'admin CITEC (nouveau client a contacter...).
// Service gratuit CallMeBot : https://www.callmebot.com/blog/free-api-whatsapp-messages/
// Reglage : variable CALLMEBOT_APIKEY (cle recue de CallMeBot pour ce numero).
// Numero : ADMIN_WHATSAPP (par defaut celui de l'admin CITEC).
export const adminWhatsapp = () => (process.env.ADMIN_WHATSAPP || "22376842672").replace(/\D/g, "");

export function alertConfigured(): boolean {
  return !!process.env.CALLMEBOT_APIKEY;
}

export async function sendAdminAlert(text: string): Promise<{ ok: boolean; info: string }> {
  const key = process.env.CALLMEBOT_APIKEY;
  if (!key) return { ok: false, info: "CALLMEBOT_APIKEY manquant" };
  const url = `${process.env.CALLMEBOT_URL || "https://api.callmebot.com/whatsapp.php"}?phone=%2B${adminWhatsapp()}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(key)}`;
  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(15_000) });
    const body = (await res.text()).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200);
    return { ok: res.ok && !/error|invalid|not/i.test(body), info: body || String(res.status) };
  } catch (e) {
    return { ok: false, info: (e as Error).message };
  }
}

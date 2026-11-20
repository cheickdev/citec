// Clients a contacter (prospects) des membres.
import { parseAmount, str } from "@/lib/util";

export const P_STATUS: Record<string, { label: string; cls: string }> = {
  TODO: { label: "À contacter", cls: "" },
  CONTACTED: { label: "Contacté", cls: "blue" },
  MEETING: { label: "Rendez-vous pris", cls: "warn" },
  WON: { label: "Client gagné", cls: "ok" },
  LOST: { label: "Pas intéressé", cls: "danger" },
};
export const NETWORKS = ["TikTok", "Facebook", "Instagram", "WhatsApp", "Snapchat", "YouTube", "Bouche à oreille", "Autre"];

/** Champs du formulaire -> donnees (sans le membre). */
export function prospectData(f: FormData) {
  const date = str(f.get("meetingDate"));
  const time = str(f.get("meetingTime"));
  const status = str(f.get("status"));
  const g = str(f.get("gender"));
  return {
    name: str(f.get("name")).slice(0, 100),
    phone: str(f.get("phone")).slice(0, 30),
    quartier: str(f.get("quartier")).slice(0, 80),
    gender: g === "F" || g === "M" ? g : "",
    network: str(f.get("network")).slice(0, 40),
    account: str(f.get("account")).slice(0, 80),
    meeting: str(f.get("meeting")).slice(0, 200),
    meetingDate: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "",
    meetingTime: /^\d{2}:\d{2}$/.test(time) ? time : "",
    travelFee: Math.max(0, parseAmount(f.get("travelFee"))),
    note: str(f.get("note")).slice(0, 500),
    projectId: str(f.get("projectId")) || null,
    ...(P_STATUS[status] ? { status } : {}),
  };
}

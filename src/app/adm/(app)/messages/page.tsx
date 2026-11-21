import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { dateTimeLabel } from "@/lib/util";
import Submit from "@/components/Submit";

export const metadata = { title: "Messages" };

async function toggleRead(f: FormData) {
  "use server";
  await requireAdmin();
  const m = await prisma.contactMessage.findUnique({ where: { id: String(f.get("id")) } });
  if (m) await prisma.contactMessage.update({ where: { id: m.id }, data: { read: !m.read } });
  revalidatePath("/", "layout");
}
async function remove(f: FormData) {
  "use server";
  await requireAdmin();
  await prisma.contactMessage.deleteMany({ where: { id: String(f.get("id")) } });
  revalidatePath("/", "layout");
}

export default async function Messages() {
  const list = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  const unread = list.filter((m) => !m.read).length;
  return (
    <>
      <div className="head"><h1>Messages du site</h1><span className="muted">{unread} non lu(s)</span></div>
      <p className="muted small" style={{ marginTop: -6 }}>Envoyés depuis le formulaire « Contactez-nous » de citec.app.</p>
      <div className="list">
        {list.length === 0 && <div className="empty">Aucun message pour le moment.</div>}
        {list.map((m) => {
          const wa = m.phone.replace(/\D/g, "");
          return (
            <div key={m.id} id={m.id} className="card" style={{ borderLeft: `4px solid ${m.read ? "var(--line)" : "var(--accent)"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <b>{!m.read && "● "}{m.name} <span className="badge blue">{m.subject}</span></b>
                <span className="muted small">{dateTimeLabel(m.createdAt)}</span>
              </div>
              <div className="muted small">{[m.phone, m.email].filter(Boolean).join(" · ")}</div>
              <div className="prewrap" style={{ margin: "8px 0 10px" }}>{m.message}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {wa && <a className="btn sm" href={`https://wa.me/${wa.length === 8 ? "223" + wa : wa}`} target="_blank" rel="noopener">💬 Répondre sur WhatsApp</a>}
                {m.email && <a className="btn ghost sm" href={`mailto:${m.email}`}>📧 Répondre par e-mail</a>}
                <form action={toggleRead}><input type="hidden" name="id" value={m.id} /><Submit className="btn ghost sm">{m.read ? "Marquer non lu" : "✓ Marquer lu"}</Submit></form>
                <form action={remove}><input type="hidden" name="id" value={m.id} /><Submit className="btn danger sm" confirm="Supprimer ce message ?">Supprimer</Submit></form>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

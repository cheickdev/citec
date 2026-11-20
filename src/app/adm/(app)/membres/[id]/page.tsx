import { Fragment } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { projectOptions } from "@/lib/projects";
import { STATUS, dayLabel, fcfa, monthLabel, thisMonth, timeLabel } from "@/lib/util";
import ActionForm from "@/components/ActionForm";
import Submit from "@/components/Submit";
import { resetPassword, toggleMember, updateMember } from "../../../actions";

export default async function MemberPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ cree?: string }> }) {
  const { id } = await params;
  const { cree } = await searchParams;
  const m = await prisma.member.findUnique({
    where: { id },
    include: {
      projects: true,
      tasks: { where: { status: { not: "DONE" } }, orderBy: { createdAt: "desc" }, take: 20, include: { project: { select: { name: true } } } },
      attendance: { where: { day: { startsWith: thisMonth() } }, orderBy: { day: "desc" } },
      payslips: { orderBy: { month: "desc" }, take: 6 },
    },
  });
  if (!m) notFound();
  const projects = await projectOptions();
  const mine = new Set(m.projects.map((p) => p.projectId));
  return (
    <>
      <p style={{ margin: "0 0 8px" }}><a href="/membres">← Membres</a></p>
      <div className="head"><h1>{m.name}</h1>{!m.active && <span className="badge">Désactivé</span>}</div>
      {cree && <div className="notice" style={{ marginBottom: 14 }}>✅ Membre créé. Donnez-lui son numéro <b>{m.phone}</b>, le mot de passe choisi, et l&apos;adresse <b>member.citec.app</b>.</div>}
      <div className="grid c2">
        <form className="card form" action={updateMember}>
          <h2>Informations</h2>
          <input type="hidden" name="id" value={m.id} />
          <div className="row">
            <div className="field"><label htmlFor="n">Nom</label><input id="n" name="name" className="input" defaultValue={m.name} required /></div>
            <div className="field"><label htmlFor="j">Poste</label><input id="j" name="jobTitle" className="input" defaultValue={m.jobTitle} /></div>
          </div>
          <div className="row">
            <div className="field"><label htmlFor="e">E-mail</label><input id="e" name="email" className="input" defaultValue={m.email} /></div>
            <div className="field"><label htmlFor="s">Salaire mensuel (F CFA)</label><input id="s" name="salary" className="input" inputMode="numeric" defaultValue={m.salary || ""} /></div>
          </div>
          <div className="field">
            <label>Projets</label>
            <div className="chips" style={{ margin: 0 }}>
              {projects.map((p) => <label key={p.id} className="chip"><input type="checkbox" name="projects" value={p.id} defaultChecked={mine.has(p.id)} /> {p.name}</label>)}
            </div>
          </div>
          <div className="field">
            <label htmlFor="r">Accès</label>
            <select id="r" name="role" className="input" defaultValue={m.role}>
              <option value="MEMBER">Membre (member.citec.app)</option>
              <option value="ADMIN">Administrateur (aussi admin.citec.app)</option>
            </select>
          </div>
          <p className="muted small" style={{ margin: 0 }}>Téléphone de connexion : <b>{m.phone}</b></p>
          <Submit>Enregistrer</Submit>
        </form>
        <div className="grid" style={{ alignContent: "start" }}>
          <ActionForm action={resetPassword}>
            <h2>Mot de passe</h2>
            <input type="hidden" name="id" value={m.id} />
            <div className="field"><label htmlFor="pw">Nouveau mot de passe</label><input id="pw" name="password" className="input" minLength={6} required /></div>
            <Submit className="btn ghost">Changer le mot de passe</Submit>
          </ActionForm>
          <form className="card form" action={toggleMember}>
            <h2>Accès</h2>
            <input type="hidden" name="id" value={m.id} />
            <p className="muted small" style={{ margin: 0 }}>{m.active ? "Désactiver empêche toute connexion. Son historique est gardé." : "Ce membre ne peut plus se connecter."}</p>
            <Submit className={m.active ? "btn danger" : "btn"} confirm={m.active ? `Désactiver ${m.name} ?` : undefined}>{m.active ? "Désactiver le membre" : "Réactiver le membre"}</Submit>
          </form>
        </div>
      </div>

      <div className="grid c2" style={{ marginTop: 16 }}>
        <div>
          <h2>Tâches en cours</h2>
          <div className="list">
            {m.tasks.length === 0 && <div className="empty">Aucune tâche en cours.</div>}
            {m.tasks.map((t) => (
              <a key={t.id} href={`/taches/${t.id}`} className="item" style={{ textDecoration: "none", color: "inherit" }}>
                <span className="grow"><b>{t.title}</b><br /><span className="muted small">{t.project?.name ?? "Entreprise"}{t.dueDate && ` · pour le ${dayLabel(t.dueDate)}`}</span></span>
                <span className={`badge ${STATUS[t.status].cls}`}>{STATUS[t.status].label}</span>
              </a>
            ))}
          </div>
        </div>
        <div>
          <h2>Présence · {monthLabel(thisMonth())}</h2>
          <div className="card">
            <p style={{ marginTop: 0 }}><b>{m.attendance.length}</b> jour(s) de présence ce mois.</p>
            <div className="kv">
              {m.attendance.slice(0, 10).map((a) => (
                <Fragment key={a.id}><span>{dayLabel(a.day)}</span><b>{timeLabel(a.inAt)} → {timeLabel(a.outAt)}</b></Fragment>
              ))}
            </div>
          </div>
          <h2 style={{ marginTop: 16 }}>Paie</h2>
          <div className="list">
            {m.payslips.length === 0 && <div className="empty">Aucune fiche de paie.</div>}
            {m.payslips.map((p) => (
              <div key={p.id} className="item">
                <span className="grow"><b>{monthLabel(p.month)}</b></span>
                <b className="num">{fcfa(p.base + p.commission + p.bonus - p.deduction)}</b>
                <span className={`badge ${p.paidAt ? "ok" : "warn"}`}>{p.paidAt ? "Payé" : "À payer"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

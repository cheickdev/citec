import { prisma } from "@/lib/db";
import { projectOptions } from "@/lib/projects";
import { addMonths, dayLabel, fcfa, monthLabel, thisMonth, today } from "@/lib/util";
import ProjectSelect from "@/components/ProjectSelect";
import Submit from "@/components/Submit";
import { addFinEntry, deleteFinEntry } from "../../actions";

export const metadata = { title: "Finances" };

const CATS = ["Ventes", "Abonnements", "Hébergement", "Domaines", "Salaires", "Publicité", "Matériel", "Transport", "Internet / téléphone", "Autre"];
const SRC: Record<string, string> = { AUTO: "automatique", PAYROLL: "paie" };

export default async function Finances({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { m } = await searchParams;
  const month = /^\d{4}-\d{2}$/.test(m ?? "") ? m! : thisMonth();
  const [entries, projects] = await Promise.all([
    prisma.finEntry.findMany({ where: { day: { startsWith: month } }, orderBy: [{ day: "desc" }, { createdAt: "desc" }], include: { project: { select: { name: true, color: true } } } }),
    projectOptions(),
  ]);
  const sum = (k: string, pid?: string | null) => entries.filter((e) => e.kind === k && (pid === undefined || e.projectId === pid)).reduce((a, e) => a + e.amount, 0);
  const income = sum("INCOME");
  const expense = sum("EXPENSE");
  const rows = [...projects.map((p) => ({ id: p.id as string | null, name: p.name, color: p.color })), { id: null, name: "Entreprise (général)", color: "#5b6577" }];
  return (
    <>
      <div className="head">
        <h1>Finances · {monthLabel(month)}</h1>
        <div style={{ display: "flex", gap: 6 }}>
          <a className="btn ghost sm" href={`?m=${addMonths(month, -1)}`}>←</a>
          <a className="btn ghost sm" href={`?m=${addMonths(month, 1)}`}>→</a>
        </div>
      </div>
      <div className="tiles">
        <div className="tile"><div className="label">Recettes</div><div className="value num" style={{ color: "var(--ok)" }}>{fcfa(income)}</div></div>
        <div className="tile"><div className="label">Dépenses</div><div className="value num" style={{ color: "var(--danger)" }}>{fcfa(expense)}</div></div>
        <div className="tile"><div className="label">Résultat</div><div className="value num" style={{ color: income - expense < 0 ? "var(--danger)" : undefined }}>{fcfa(income - expense)}</div></div>
      </div>
      <div className="card scroll-x" style={{ marginBottom: 16 }}>
        <h2>Par projet</h2>
        <table className="t">
          <thead><tr><th>Projet</th><th className="r">Recettes</th><th className="r">Dépenses</th><th className="r">Résultat</th></tr></thead>
          <tbody>
            {rows.map((r) => {
              const i = sum("INCOME", r.id);
              const e = sum("EXPENSE", r.id);
              return (
                <tr key={r.name}>
                  <td><span className="dot" style={{ background: r.color, marginRight: 6 }} />{r.name}</td>
                  <td className="r num">{fcfa(i)}</td>
                  <td className="r num">{fcfa(e)}</td>
                  <td className="r num" style={{ fontWeight: 700, color: i - e < 0 ? "var(--danger)" : undefined }}>{fcfa(i - e)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <details className="card" style={{ marginBottom: 16 }}>
        <summary>➕ Ajouter une recette ou une dépense</summary>
        <form className="form" action={addFinEntry}>
          <div className="row">
            <div className="field">
              <label htmlFor="k">Type</label>
              <select id="k" name="kind" className="input" defaultValue="EXPENSE"><option value="EXPENSE">Dépense</option><option value="INCOME">Recette</option></select>
            </div>
            <div className="field"><label htmlFor="a">Montant (F CFA)</label><input id="a" name="amount" className="input num" inputMode="numeric" required /></div>
            <div className="field"><label htmlFor="d">Date</label><input id="d" name="day" type="date" className="input" defaultValue={month === thisMonth() ? today() : `${month}-01`} /></div>
          </div>
          <div className="row">
            <ProjectSelect projects={projects} empty="Entreprise (général)" />
            <div className="field">
              <label htmlFor="c">Catégorie</label>
              <input id="c" name="category" className="input" list="cats" placeholder="Ex. Hébergement" />
              <datalist id="cats">{CATS.map((c) => <option key={c} value={c} />)}</datalist>
            </div>
          </div>
          <div className="field"><label htmlFor="l">Libellé</label><input id="l" name="label" className="input" placeholder="Ex. Abonnement Vercel" /></div>
          <Submit>Ajouter</Submit>
        </form>
      </details>
      <div className="list">
        {entries.length === 0 && <div className="empty">Aucune opération ce mois.</div>}
        {entries.map((e) => (
          <div key={e.id} className="item" style={{ borderLeft: `4px solid ${e.project?.color ?? "var(--line)"}` }}>
            <span className="grow">
              <b>{e.label || e.category || (e.kind === "INCOME" ? "Recette" : "Dépense")}</b>
              <br />
              <span className="muted small">{dayLabel(e.day)} · {e.project?.name ?? "Entreprise"}{e.category && ` · ${e.category}`}{SRC[e.source] && ` · ${SRC[e.source]}`}</span>
            </span>
            <b className="num" style={{ color: e.kind === "INCOME" ? "var(--ok)" : "var(--danger)" }}>{e.kind === "INCOME" ? "+" : "−"}{fcfa(e.amount)}</b>
            {e.source === "MANUAL" && (
              <form action={deleteFinEntry}><input type="hidden" name="id" value={e.id} /><Submit className="btn ghost sm" confirm="Supprimer cette ligne ?">✕</Submit></form>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

import ProjectSelect from "@/components/ProjectSelect";

/** Champs d'une tache (creation et modification). */
export default function TaskFields({ projects, members, t }: { projects: { id: string; name: string }[]; members: { id: string; name: string }[]; t?: { title: string; description: string; projectId: string | null; assigneeId: string | null; priority: string; dueDate: string } }) {
  return (
    <>
      <div className="field"><label htmlFor="tt">Tâche</label><input id="tt" name="title" className="input" defaultValue={t?.title} required placeholder="Ex. Relancer les boutiques en fin d'essai" /></div>
      <div className="field"><label htmlFor="td">Détails (facultatif)</label><textarea id="td" name="description" className="input" defaultValue={t?.description} /></div>
      <div className="row">
        <ProjectSelect projects={projects} value={t?.projectId} empty="Entreprise (aucun projet)" />
        <div className="field">
          <label htmlFor="ta">Confiée à</label>
          <select id="ta" name="assigneeId" className="input" defaultValue={t?.assigneeId ?? ""}>
            <option value="">Personne pour l&apos;instant</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="tp">Priorité</label>
          <select id="tp" name="priority" className="input" defaultValue={t?.priority ?? "NORMAL"}>
            <option value="LOW">Basse</option>
            <option value="NORMAL">Normale</option>
            <option value="HIGH">Urgente</option>
          </select>
        </div>
        <div className="field"><label htmlFor="tdd">Pour le (facultatif)</label><input id="tdd" name="dueDate" type="date" className="input" defaultValue={t?.dueDate} /></div>
      </div>
    </>
  );
}

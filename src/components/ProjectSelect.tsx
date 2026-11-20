export default function ProjectSelect({ projects, value = "", name = "projectId", label = "Projet", empty = "Toute l'entreprise" }: { projects: { id: string; name: string }[]; value?: string | null; name?: string; label?: string; empty?: string }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <select id={name} name={name} className="input" defaultValue={value ?? ""}>
        <option value="">{empty}</option>
        {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
    </div>
  );
}

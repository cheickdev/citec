"use client";

import { useFormStatus } from "react-dom";

/** Bouton d'envoi qui patiente pendant l'enregistrement. confirm : question avant d'envoyer. */
export default function Submit({ children, className = "btn", confirm: ask, formAction }: { children: React.ReactNode; className?: string; confirm?: string; formAction?: (f: FormData) => void | Promise<void> }) {
  const { pending } = useFormStatus();
  return (
    <button className={className} disabled={pending} formAction={formAction} onClick={(e) => { if (ask && !window.confirm(ask)) e.preventDefault(); }}>
      {pending ? "Patientez…" : children}
    </button>
  );
}

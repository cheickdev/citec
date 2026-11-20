"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

type State = { error?: string; ok?: string; go?: string } | null;

/** Formulaire qui affiche le message renvoye par l'action ; « go » : page a ouvrir ensuite. */
export default function ActionForm({ action, children, className = "card form", reset = false }: { action: (s: State, f: FormData) => Promise<State>; children: React.ReactNode; className?: string; reset?: boolean }) {
  const [state, run] = useActionState(action, null);
  const router = useRouter();
  useEffect(() => {
    if (state?.go) router.push(state.go);
  }, [state, router]);
  return (
    <form className={className} action={run} key={reset && state?.ok ? state.ok : undefined}>
      {children}
      {state?.error && <div className="error">{state.error}</div>}
      {state?.ok && <div className="notice">{state.ok}</div>}
    </form>
  );
}

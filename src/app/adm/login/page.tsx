import { redirect } from "next/navigation";
import { adminLogin, getAdmin } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Administration" };

async function login(_: string | null, f: FormData): Promise<string | null> {
  "use server";
  if (!(await adminLogin(String(f.get("phone") ?? ""), String(f.get("password") ?? "")))) return "Téléphone ou mot de passe incorrect.";
  return "OK";
}

export default async function AdminLogin() {
  if (await getAdmin()) redirect("/");
  return <LoginForm action={login} title="Administration" hint="Réservé à la direction." />;
}

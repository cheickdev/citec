import { redirect } from "next/navigation";
import { getMember, memberLogin } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Espace membre" };

async function login(_: string | null, f: FormData): Promise<string | null> {
  "use server";
  if (!(await memberLogin(String(f.get("phone") ?? ""), String(f.get("password") ?? "")))) return "Téléphone ou mot de passe incorrect.";
  return "OK";
}

export default async function MemberLogin() {
  if (await getMember()) redirect("/");
  return <LoginForm action={login} title="Espace membre" hint="Votre mot de passe vous est donné par l'administration." />;
}

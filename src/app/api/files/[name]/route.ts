import { getAdmin, getMember } from "@/lib/auth";
import { readLocalFile } from "@/lib/storage";

// Documents en local (developpement). En ligne, ils sont sur Vercel Blob.
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  if (!(await getAdmin()) && !(await getMember())) return new Response("Non autorisé", { status: 401 });
  const { name } = await params;
  const buf = await readLocalFile(name);
  if (!buf) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(buf), { headers: { "Content-Disposition": `inline; filename="${name.replace(/^[a-f0-9]+-/, "")}"` } });
}

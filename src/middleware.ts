// Un seul site, deux adresses :
//   admin.citec.app/...  -> pages de src/app/adm/...
//   member.citec.app/... -> pages de src/app/mem/...
// En local : admin.localhost:3470 et member.localhost:3470.
// Autre adresse (citec.app, apercu Vercel) : page d'accueil avec les liens vers les deux espaces.
import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase();
  const url = req.nextUrl.clone();
  const p = url.pathname;
  const space = host.startsWith("admin.") ? "adm" : host.startsWith("member.") ? "mem" : null;
  // Les dossiers internes ne s'ouvrent jamais directement.
  if (/^\/(adm|mem)(\/|$)/.test(p)) return new NextResponse("Not found", { status: 404 });
  if (!space) return NextResponse.next(); // page d'accueil (src/app/page.tsx)
  url.pathname = `/${space}${p === "/" ? "" : p}`;
  return NextResponse.rewrite(url);
}

export const config = { matcher: ["/((?!api|_next|favicon|icon|.*\\.[a-z0-9]+$).*)"] };

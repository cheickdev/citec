// Documents partages : stockes HORS de la base (Vercel Blob en ligne, dossier .uploads en local).
import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";

const LOCAL_DIR = path.join(process.cwd(), ".uploads");
const useBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

export async function saveFile(name: string, data: Buffer, contentType: string): Promise<string> {
  const safe = name.normalize("NFD").replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(-80) || "fichier";
  const key = `${crypto.randomBytes(8).toString("hex")}-${safe}`;
  if (useBlob()) {
    const { put } = await import("@vercel/blob");
    return (await put(`docs/${key}`, data, { access: "public", contentType: contentType || "application/octet-stream", addRandomSuffix: false })).url;
  }
  await fs.mkdir(LOCAL_DIR, { recursive: true });
  await fs.writeFile(path.join(LOCAL_DIR, key), data);
  return `/api/files/${key}`;
}

export async function deleteFile(url: string): Promise<void> {
  try {
    if (url.startsWith("/api/files/")) await fs.unlink(path.join(LOCAL_DIR, path.basename(url)));
    else if (useBlob() && url.includes(".blob.vercel-storage.com/docs/")) {
      const { del } = await import("@vercel/blob");
      await del(url);
    }
  } catch {
    // deja absent
  }
}

export async function readLocalFile(name: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(path.join(LOCAL_DIR, path.basename(name)));
  } catch {
    return null;
  }
}

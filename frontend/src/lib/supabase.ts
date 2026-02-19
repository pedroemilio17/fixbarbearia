import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anon) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

function tryExtractKeyRef(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), "=");
    const json = JSON.parse(atob(normalized.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof json?.ref === "string" ? json.ref : null;
  } catch {
    return null;
  }
}

try {
  const urlRef = new URL(url).hostname.split(".")[0];
  const keyRef = tryExtractKeyRef(anon);

  if (keyRef && urlRef !== keyRef) {
    console.error(
      `Supabase env inconsistente: URL ref (${urlRef}) != ANON_KEY ref (${keyRef}). Corrija as variáveis da Vercel.`
    );
  }
} catch {}

export const supabase = createClient(url, anon);

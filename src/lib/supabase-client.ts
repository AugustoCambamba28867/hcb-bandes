import { createClient } from "@supabase/supabase-js";

function normalizeSupabaseUrl(url: string | undefined) {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/\/rest\/v1\/?$/, "");
}

const isTest = typeof process !== "undefined" && process.env.NODE_ENV === "test";

const supabaseUrl = isTest ? undefined : normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = isTest ? undefined : import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const supabaseEnabled = Boolean(supabase);

export async function isSupabaseConfigured() {
  return Boolean(supabase && supabaseUrl && supabaseAnonKey);
}

export async function getSupabaseErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "message" in error && typeof (error as { message?: unknown }).message === "string") {
    return (error as { message: string }).message;
  }
  return "Erro inesperado ao comunicar com a base de dados.";
}

/**
 * Script de Keep-Alive para evitar suspensão da base de dados Supabase por inactividade (7 dias).
 * Pode ser executado localmente ou automaticamente via GitHub Actions / Cron.
 */

const SUPABASE_URL = (
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://kxmkysvwyboddkrstfwk.supabase.co"
).replace(/\/rest\/v1\/?$/, "");

const SUPABASE_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_2YUzrH6y7C3Z9QLSM9Fdjw_jKA3SOqh";

const SITE_URL = process.env.SITE_URL || "https://hcb-bandes.co";

async function pingSupabase() {
  const endpoint = `${SUPABASE_URL}/rest/v1/site_settings?select=id&limit=1`;
  console.log(`[Keep-Alive] Disparando requisição para Supabase: ${endpoint}`);

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      console.log(`[Keep-Alive] Sucesso Supabase! Status: ${response.status} ${response.statusText}`);
      const data = await response.json();
      console.log(`[Keep-Alive] Resposta recebida:`, data);
      return true;
    } else {
      console.warn(`[Keep-Alive] Supabase respondeu com status: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.warn(`[Keep-Alive] Resposta:`, text);
      return false;
    }
  } catch (error) {
    console.error(`[Keep-Alive] Erro ao comunicar com Supabase:`, error);
    return false;
  }
}

async function pingWebsite() {
  console.log(`[Keep-Alive] Disparando requisição para o site: ${SITE_URL}`);
  try {
    const response = await fetch(SITE_URL, {
      method: "GET",
      headers: {
        "User-Agent": "HCB-Bandes-KeepAlive/1.0",
      },
    });
    console.log(`[Keep-Alive] Sucesso Site! Status: ${response.status} ${response.statusText}`);
    return response.ok;
  } catch (error) {
    console.warn(`[Keep-Alive] Aviso ao aceder ao site:`, error.message);
    return false;
  }
}

async function run() {
  console.log(`=== HCB-BANDES KEEP-ALIVE [${new Date().toISOString()}] ===`);
  const [dbOk, siteOk] = await Promise.all([pingSupabase(), pingWebsite()]);

  if (dbOk) {
    console.log(`[Keep-Alive] Base de dados Supabase activa com sucesso.`);
    process.exit(0);
  } else {
    console.warn(`[Keep-Alive] Atenção: A requisição ao Supabase não retornou 200 OK.`);
    process.exit(siteOk ? 0 : 1);
  }
}

run();

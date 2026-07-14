const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = {};
for (const line of fs.readFileSync('.env','utf8').split(/\r?\n/)) {
  if (!line || line.startsWith('#')) continue;
  const idx = line.indexOf('=');
  if (idx === -1) continue;
  const key = line.slice(0, idx).trim();
  const value = line.slice(idx + 1).trim();
  env[key] = value.replace(/^['\"]|['\"]$/g, '');
}
const baseUrl = (env.VITE_SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '');
const supabase = createClient(baseUrl, env.VITE_SUPABASE_ANON_KEY || 'anon', {
  auth: { persistSession: false, autoRefreshToken: false },
});
(async () => {
  const { data, error } = await supabase.from('site_settings').select('empresa').limit(1);
  console.log(JSON.stringify({
    baseUrl,
    error: error ? { message: error.message, code: error.code, details: error.details, hint: error.hint } : null,
    data,
  }, null, 2));
})();

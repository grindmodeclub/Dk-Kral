// Prebudovanie webu po úprave v administrácii (volá ho src/pages/admin/rebuild.ts).
// Spustiť ho môže len prihlásený admin (rovnaké pravidlo ako RLS v Supabase: app_metadata.is_admin),
// URL build hooku ostáva na serveri.
export default async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const hook = process.env.DAILY_BUILD_HOOK_URL;
  if (!supabaseUrl || !anonKey || !hook) {
    console.error('Chýba VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY alebo DAILY_BUILD_HOOK_URL');
    return new Response('Server misconfigured', { status: 500 });
  }

  const authorization = req.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return new Response('Unauthorized', { status: 401 });

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: authorization },
  });
  if (!userResponse.ok) return new Response('Unauthorized', { status: 401 });
  const user = await userResponse.json();
  if (String(user?.app_metadata?.is_admin) !== 'true') return new Response('Forbidden', { status: 403 });

  const res = await fetch(hook, { method: 'POST' });
  console.log(`Build hook po úprave v administrácii: ${res.status}`);
  return new Response(null, { status: res.ok ? 202 : 502 });
};

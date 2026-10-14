// Denný rebuild: prerenderované HTML berie dáta zo Supabase pri builde, takže zmeny z administrácie
// (ceník, tým, služby, dovolenky) sa do HTML pre vyhľadávače dostanú najneskôr do druhého dňa.
// Návštevníci vidia zmeny hneď – prehliadač si dáta obnoví sám.
export default async () => {
  const hook = process.env.DAILY_BUILD_HOOK_URL;
  if (!hook) {
    console.error('DAILY_BUILD_HOOK_URL nie je nastavené');
    return;
  }
  const res = await fetch(hook, { method: 'POST' });
  console.log(`Build hook: ${res.status}`);
};

export const config = {
  schedule: '0 3 * * *',
};

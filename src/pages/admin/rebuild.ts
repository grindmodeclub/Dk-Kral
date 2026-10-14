// Prebudovanie webu po úpravách v administrácii. Verejné stránky sú prerenderované pri builde,
// takže bez nového buildu by Google a AI vyhľadávače videli staré ceny, tým či dovolenky.
// Viac úprav za sebou sa zlúči do jedného buildu (spustí sa minútu po poslednej úprave).
import { supabase } from '../../lib/supabase';

const DELAY_MS = 60_000;
const ENDPOINT = '/.netlify/functions/rebuild-after-admin';

let timer: number | undefined;
let accessToken: string | null = null;

const send = () => {
  timer = undefined;
  if (!accessToken) return;
  // keepalive: požiadavka dobehne aj pri zatvorení záložky
  fetch(ENDPOINT, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` }, keepalive: true }).catch(() => {});
};

export const scheduleRebuild = () => {
  supabase.auth.getSession().then(({ data }) => {
    accessToken = data.session?.access_token ?? null;
  });
  window.clearTimeout(timer);
  timer = window.setTimeout(send, DELAY_MS);
};

/** Pri odchode z administrácie sa čakajúci build spustí hneď. */
export const flushRebuild = () => {
  if (timer === undefined) return;
  window.clearTimeout(timer);
  send();
};

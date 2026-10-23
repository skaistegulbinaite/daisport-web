// Shared by every page. The anon key is public by design (the database rules
// decide what anyone may read); the Stripe key never comes near the browser.
const BRAND = 'NOKTI';
const SUPABASE_URL = 'https://cfyhqovlfehaczfitxeg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_510zrY7-pMmbIEpSOU-xdg__IYkWzRU';
// Where clients get the app. Empty until the App Store page is public.
const APP_STORE_URL = '';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

const $ = (id) => document.getElementById(id);
const show = (el, on = true) => { (typeof el === 'string' ? $(el) : el).hidden = !on; };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const euro = (cents) => (cents / 100).toLocaleString('lt-LT', { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 }) + ' €';

/** 84 -> "12 savaičių", 90 -> "3 mėnesių", 10 -> "10 dienų" (after "Trukmė:") */
function lengthLabel(days) {
  if (days % 30 === 0) { const n = days / 30; return n + ' ' + (n === 1 ? 'mėnuo' : n < 10 ? 'mėnesiai' : 'mėnesių'); }
  if (days % 7 === 0) { const n = days / 7; return n + ' ' + (n === 1 ? 'savaitė' : n < 10 ? 'savaitės' : 'savaičių'); }
  return days + ' ' + (days === 1 ? 'diena' : days < 10 ? 'dienos' : 'dienų');
}
function priceLabel(p) {
  return p.kind === 'monthly' ? `${euro(p.price_cents)} / mėn.` : euro(p.price_cents);
}
function whenLabel(p) {
  return p.kind === 'monthly' ? 'Kas mėnesį, kol mokama' : 'Vienkartinis mokėjimas · ' + lengthLabel(p.access_days);
}
const dateLt = (iso) => new Date(iso).toLocaleDateString('lt-LT', { year: 'numeric', month: 'long', day: 'numeric' });

async function fn(name, body) {
  const { data, error } = await sb.functions.invoke(name, { body });
  if (error) {
    let msg = error.message;
    try { const j = await error.context.json(); msg = j.error || msg; } catch (_) {}
    throw new Error(msg);
  }
  return data;
}
async function copy(text, btn) {
  try { await navigator.clipboard.writeText(text); if (btn) { const t = btn.textContent; btn.textContent = 'Nukopijuota'; setTimeout(() => (btn.textContent = t), 1500); } }
  catch (_) { window.prompt('Nukopijuokite:', text); }
}
document.querySelectorAll('[data-brand]').forEach((el) => (el.textContent = BRAND));

// Cloudflare Worker — relays shop orders to your Telegram bot.
// Settings → Variables and Secrets: BOT_TOKEN (secret) and CHAT_ID (your own chat id).
// If your current Worker uses different variable names, change env.BOT_TOKEN / env.CHAT_ID below.

const CORS = {
  'Access-Control-Allow-Origin': '*',          // tighten to your site, e.g. 'https://yourshop.pages.dev'
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};
const MAX_PDF = 5 * 1024 * 1024; // 5 MB

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (req.method !== 'POST') return new Response('ok', { headers: CORS });

    const api = `https://api.telegram.org/bot${env.8535955747:AAFKf_hG9VsXsL6ninqKHtGXYopqpDfxKRc}/`;
    const type = req.headers.get('content-type') || '';
    let res;

    try {
      if (type.includes('multipart/form-data')) {
        // PDF invoice
        const form = await req.formData();
        const file = form.get('document');
        if (!file || typeof file === 'string' || !file.size || file.size > MAX_PDF)
          return new Response('bad file', { status: 400, headers: CORS });

        const fd = new FormData();
        fd.append('chat_id', env.871061578);
        fd.append('caption', String(form.get('caption') || '').slice(0, 1000));
        fd.append('document', file, String(file.name || 'order.pdf'));
        res = await fetch(api + 'sendDocument', { method: 'POST', body: fd });
      } else {
        // Text order (existing behaviour)
        const { text } = await req.json();
        if (!text) return new Response('no text', { status: 400, headers: CORS });
        res = await fetch(api + 'sendMessage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: env.CHAT_ID, text: String(text).slice(0, 4000) })
        });
      }
    } catch (e) {
      return new Response('error', { status: 500, headers: CORS });
    }

    return new Response(res.ok ? 'ok' : 'telegram error', { status: res.ok ? 200 : 502, headers: CORS });
  }
};

/**
 * Contact form endpoint for Vercel (replaces assets/php/contact.php, which Vercel cannot run).
 * Same behaviour as the PHP version:
 *
 *   To:       sivan@physiotherapy.co.il
 *   Subject:  פנייה מהאתר | <sender's name>
 *   Reply-To: the sender's e-mail
 *
 * Sends through Resend (https://resend.com), no npm packages needed. Set in Vercel → Project → Settings →
 * Environment Variables:
 *   RESEND_API_KEY  (required)  API key from resend.com
 *   CONTACT_FROM    (optional)  sender, default "אתר סיון נבות <website@mail.physiotherapy.co.il>";
 *                               the subdomain mail.physiotherapy.co.il must be verified in Resend (a subdomain keeps
 *                               Sivan's own mailbox DNS on physiotherapy.co.il untouched). Use a sending-only key.
 *   CONTACT_TO      (optional)  recipient, default sivan@physiotherapy.co.il
 * Used by assets/js/form.js (fetch, JSON answer) on every page, Hebrew and English.
 */
export const config = { runtime: 'edge' };

const TO = 'sivan@physiotherapy.co.il';
const FROM = 'אתר סיון נבות <website@mail.physiotherapy.co.il>';
const SUBJECT = 'פנייה מהאתר | ';

function answer(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff' },
  });
}

// one line, no control characters (stops header injection through the name)
function cleanLine(v, max) {
  return String(v ?? '').replace(/[\r\n\t\x00-\x1F\x7F]+/g, ' ').trim().slice(0, max);
}

export default async function handler(request) {
  if (request.method !== 'POST') return answer(405, { ok: false, error: 'method' });

  let form;
  try {
    form = await request.formData();
  } catch {
    return answer(400, { ok: false, error: 'body' });
  }
  const get = (k) => form.get(k) ?? '';

  // honeypot: a field people never see; bots fill it in. Pretend it worked.
  if (String(get('website')).trim() !== '') return answer(200, { ok: true });

  const name = cleanLine(get('input_1'), 120);
  const phone = cleanLine(get('input_2'), 40);
  const email = cleanLine(get('input_3'), 160);
  const message = String(get('input_4')).replace(/\r\n/g, '\n').trim().slice(0, 5000);
  const consent = !!(form.get('input_5_1') || form.get('input_5.1'));
  const page = cleanLine(get('page'), 300);
  const lang = get('lang') === 'en' ? 'en' : 'he';

  const errors = [];
  if (!name) errors.push('input_1');
  if (phone.replace(/\D/g, '').length < 9) errors.push('input_2');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('input_3');
  if (!consent) errors.push('input_5.1');
  if (errors.length) return answer(422, { ok: false, error: 'invalid', fields: errors });

  const date = new Intl.DateTimeFormat('he-IL', {
    timeZone: 'Asia/Jerusalem', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date());

  const text = [
    'פנייה חדשה מטופס יצירת הקשר באתר' + (lang === 'en' ? ' (הגרסה האנגלית)' : ''),
    '',
    'שם: ' + name,
    'טלפון: ' + phone,
    'דוא"ל: ' + email,
    '',
    'הודעה:',
    message || '(ללא הודעה)',
    '',
    '—',
    'נשלח מהעמוד: ' + (page || 'לא ידוע'),
    'הסכמה למדיניות הפרטיות: כן',
    'תאריך: ' + date,
  ].join('\n');

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error('contact: RESEND_API_KEY is not set');
    return answer(500, { ok: false, error: 'mail' });
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || FROM,
        to: [process.env.CONTACT_TO || TO],
        reply_to: email,
        subject: SUBJECT + name,
        text,
      }),
    });
    if (!r.ok) {
      console.error('contact: Resend answered', r.status, await r.text());
      return answer(500, { ok: false, error: 'mail' });
    }
  } catch (e) {
    console.error('contact: send failed', e);
    return answer(500, { ok: false, error: 'mail' });
  }
  return answer(200, { ok: true });
}

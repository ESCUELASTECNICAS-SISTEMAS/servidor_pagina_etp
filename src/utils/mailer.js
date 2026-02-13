require('dotenv').config();
const nodemailer = require('nodemailer');
const dns = require('dns');
const axios = require('axios');

// Prefer IPv4 lookups where available to avoid ENETUNREACH on environments without IPv6
if (dns.setDefaultResultOrder) {
  try {
    dns.setDefaultResultOrder('ipv4first');
    console.log('DNS: set default result order to ipv4first');
  } catch (e) {
    console.log('DNS: could not set result order', e && e.message ? e.message : e);
  }
}

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.MAIL_FROM || SMTP_USER;
const PUBLIC_URL = process.env.PUBLIC_URL || '';
const BREVO_API_KEY = process.env.BREVO_API_KEY;

let brevoClient = null;
if (BREVO_API_KEY) {
  brevoClient = axios.create({
    baseURL: 'https://api.brevo.com/v3',
    headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
    timeout: process.env.SMTP_CONNECTION_TIMEOUT ? parseInt(process.env.SMTP_CONNECTION_TIMEOUT, 10) : 20000
  });
  console.log('Mailer: Brevo API client configured (api-key present)');
}

const BREVO_CAMPAIGN_LIST_IDS = process.env.BREVO_CAMPAIGN_LIST_IDS; // comma-separated list IDs

let transporter = null;
if (SMTP_HOST && SMTP_USER) {
  const port = SMTP_PORT ? parseInt(SMTP_PORT, 10) : 587;
  const isSecure = port === 465;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: isSecure,
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    requireTLS: true,
    tls: { rejectUnauthorized: false },
    // timeouts (ms) - configurable via SMTP_CONNECTION_TIMEOUT env
    connectionTimeout: process.env.SMTP_CONNECTION_TIMEOUT ? parseInt(process.env.SMTP_CONNECTION_TIMEOUT, 10) : 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000
  });
}

// Diagnostic: log transporter status and attempt a verify when possible
if (transporter) {
  const maskedUser = SMTP_USER ? SMTP_USER.replace(/(.{2}).+(@.+)/, '$1***$2') : 'unset';
  console.log('Mailer configured with host:', SMTP_HOST, 'port:', SMTP_PORT || '(default 587)', 'user:', maskedUser);
  transporter.verify().then(() => {
    console.log('Mailer: SMTP connection OK');
  }).catch(err => {
    console.error('Mailer: SMTP connection failed:', err && err.message ? err.message : err);
    if (err && err.stack) console.error(err.stack);
  });
} else {
  console.log('Mailer not configured (missing SMTP_HOST or SMTP_USER)');
}

async function sendNewsNotification(recipients, noticia) {
  if (!recipients || recipients.length === 0) return;
  const subject = `Nueva noticia: ${noticia.title}`;
  const text = `${noticia.summary || ''}\n\nVer la noticia: ${PUBLIC_URL}/noticias/${noticia.id}`;
  const html = `<h1>${noticia.title}</h1><p>${noticia.summary || ''}</p><p><a href="${PUBLIC_URL}/noticias/${noticia.id}">Ver noticia</a></p>`;

  // If Brevo API key present, prefer API sending (works from PaaS where SMTP is blocked)
  if (brevoClient) {
    // If campaign list IDs are configured, create a campaign and send it
    if (BREVO_CAMPAIGN_LIST_IDS) {
      try {
        const listIds = BREVO_CAMPAIGN_LIST_IDS.split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
        if (listIds.length === 0) throw new Error('BREVO_CAMPAIGN_LIST_IDS is set but no valid IDs parsed');
        const campaignPayload = {
          name: `Noticia: ${noticia.title}`,
          subject,
          sender: { email: FROM_EMAIL, name: process.env.MAIL_FROM_NAME || '' },
          type: 'classic',
          htmlContent: html,
          recipients: { listIds }
        };
        console.log('Mailer: creating Brevo campaign for lists', listIds);
        const createRes = await brevoClient.post('/emailCampaigns', campaignPayload);
        const campaignId = createRes && createRes.data && createRes.data.id;
        console.log('Mailer: Brevo campaign created id=', campaignId);
        if (campaignId) {
          console.log('Mailer: sending Brevo campaign now id=', campaignId);
          const sendRes = await brevoClient.post(`/emailCampaigns/${campaignId}/sendNow`);
          console.log('Mailer: Brevo campaign sendNow status=', sendRes && sendRes.status);
          return { campaignId, sendStatus: sendRes && sendRes.status };
        }
      } catch (campErr) {
        console.error('Mailer: Brevo campaign error:', campErr && campErr.message ? campErr.message : campErr);
        if (campErr && campErr.stack) console.error(campErr.stack);
        // fallthrough to transactional API or SMTP
      }
    }

    try {
      const to = recipients && recipients.length > 0 ? [{ email: recipients[0] }] : [];
      const bcc = recipients && recipients.length > 1 ? recipients.slice(1).map(r => ({ email: r })) : [];
      const payload = {
        sender: { email: FROM_EMAIL },
        to,
        bcc,
        subject,
        htmlContent: html,
        textContent: text
      };
      console.log('Mailer: sending via Brevo transactional API to', recipients.length, 'recipients');
      const resp = await brevoClient.post('/smtp/email', payload);
      console.log('Mailer: Brevo API send status=', resp && resp.status);
      return resp.data;
    } catch (apiErr) {
      console.error('Mailer: Brevo API send error:', apiErr && apiErr.message ? apiErr.message : apiErr);
      if (apiErr && apiErr.stack) console.error(apiErr.stack);
      // fallthrough to try SMTP if available
    }
  }

  if (!transporter) {
    console.log('Mail not configured (no transporter and no Brevo API) - would send to:', recipients);
    console.log('Subject:', subject);
    return;
  }

  const mailOptions = {
    from: FROM_EMAIL,
    bcc: recipients,
    subject,
    text,
    html
  };

  console.log('Mailer: sending email to', recipients.length, 'recipients, from:', FROM_EMAIL);
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Mailer: sendMail completed, messageId=', info && info.messageId);
    return info;
  } catch (sendErr) {
    console.error('Mailer: sendMail error:', sendErr && sendErr.message ? sendErr.message : sendErr);
    if (sendErr && sendErr.stack) console.error(sendErr.stack);
    throw sendErr;
  }
}

module.exports = { sendNewsNotification };

async function verifyTransporter() {
  if (brevoClient) {
    try {
      // try a lightweight account request to validate API key
      const res = await brevoClient.get('/account');
      if (res && res.status === 200) return { ok: true, message: 'Brevo API key valid' };
      return { ok: false, message: 'Brevo API unexpected response: ' + (res && res.status) };
    } catch (err) {
      return { ok: false, message: err && err.message ? err.message : String(err) };
    }
  }

  if (!transporter) return { ok: false, message: 'transporter not configured' };
  try {
    await transporter.verify();
    return { ok: true, message: 'SMTP connection OK' };
  } catch (err) {
    return { ok: false, message: err && err.message ? err.message : String(err) };
  }
}

module.exports = { sendNewsNotification, verifyTransporter };

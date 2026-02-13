const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.MAIL_FROM || SMTP_USER;
const PUBLIC_URL = process.env.PUBLIC_URL || '';

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

  if (!transporter) {
    console.log('Mail not configured - would send to:', recipients);
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
  if (!transporter) return { ok: false, message: 'transporter not configured' };
  try {
    await transporter.verify();
    return { ok: true, message: 'SMTP connection OK' };
  } catch (err) {
    return { ok: false, message: err && err.message ? err.message : String(err) };
  }
}

module.exports = { sendNewsNotification, verifyTransporter };

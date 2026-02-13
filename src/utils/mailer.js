const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.MAIL_FROM || SMTP_USER;
const PUBLIC_URL = process.env.PUBLIC_URL || '';

let transporter = null;
if (SMTP_HOST && SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT ? parseInt(SMTP_PORT, 10) : 587,
    secure: SMTP_PORT && parseInt(SMTP_PORT, 10) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
}

// Diagnostic: log transporter status and attempt a verify when possible
if (transporter) {
  console.log('Mailer configured with host:', SMTP_HOST, 'port:', SMTP_PORT, 'user:', SMTP_USER ? 'set' : 'unset');
  transporter.verify().then(() => {
    console.log('Mailer: SMTP connection OK');
  }).catch(err => {
    console.error('Mailer: SMTP connection failed:', err && err.message ? err.message : err);
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

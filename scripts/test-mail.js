require('dotenv').config();

const { verifyTransporter, sendNewsNotification } = require('../src/utils/mailer');

const recipientArg = process.argv[2];
const RECIPIENT = recipientArg || process.env.TEST_MAIL_RECIPIENT || process.env.SMTP_USER || process.env.MAIL_FROM;

if (!RECIPIENT) {
  console.error('No recipient specified. Provide as arg or set TEST_MAIL_RECIPIENT in .env');
  process.exit(1);
}

(async () => {
  try {
    console.log('Verificando transporter...');
    const res = await verifyTransporter();
    console.log('verifyTransporter ->', res);
    if (!res.ok) {
      console.error('Transporter no está OK, abortando envío de prueba.');
      process.exit(2);
    }

    const noticia = {
      id: 'test-email',
      title: 'Correo de prueba desde servidor',
      summary: 'Este es un correo de prueba para verificar la configuración SMTP.'
    };

    console.log('Enviando correo de prueba a', RECIPIENT);
    const info = await sendNewsNotification([RECIPIENT], noticia);
    console.log('Resultado sendMail:', info);
    console.log('Listo.');
    process.exit(0);
  } catch (err) {
    console.error('Error al enviar correo de prueba:', err && err.message ? err.message : err);
    if (err && err.stack) console.error(err.stack);
    process.exit(3);
  }
})();

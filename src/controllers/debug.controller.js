const mailer = require('../utils/mailer');

exports.mail = async (req, res) => {
  try {
    const status = await mailer.verifyTransporter();
    if (status.ok) return res.json({ ok: true, message: status.message });
    return res.status(500).json({ ok: false, message: status.message });
  } catch (err) {
    console.error('Debug mail error:', err);
    return res.status(500).json({ ok: false, message: 'internal error' });
  }
};

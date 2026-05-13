const transporter = require('../config/email');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const FROM = `"${process.env.SMTP_FROM_NAME || 'CivicConnect'}" <${process.env.SMTP_FROM_EMAIL || 'noreply@civicconnect.city'}>`;

/**
 * Loads an HTML email template and replaces {{KEY}} placeholders.
 */
function loadTemplate(templateName, data = {}) {
  const templatePath = path.join(__dirname, '../templates/email', `${templateName}.html`);
  let html = fs.readFileSync(templatePath, 'utf8');
  Object.entries(data).forEach(([key, value]) => {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), String(value ?? ''));
  });
  return html;
}

/**
 * Sends an email asynchronously (fire-and-forget).
 * Errors are logged but never thrown to the caller.
 */
async function sendEmail({ to, subject, template, data = {}, html: rawHtml }) {
  try {
    const html = rawHtml || loadTemplate(template, data);
    await transporter.sendMail({ from: FROM, to, subject, html });
    logger.info({ msg: 'Email sent', to, subject });
  } catch (err) {
    logger.error({ msg: 'Email send failed', to, subject, error: err.message });
  }
}

module.exports = { sendEmail };

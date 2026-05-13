require('dotenv').config();

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'REFRESH_TOKEN_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
  'FRONTEND_URL',
  'ALLOWED_ORIGINS',
  'SUPER_ADMIN_ALLOWED_IPS',
];

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    missing.forEach((key) => console.error(`FATAL: Missing required environment variable: ${key}`));
    process.exit(1);
  }
}

module.exports = { validateEnv };

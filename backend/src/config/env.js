import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/eluno_orders',
  NODE_ENV: process.env.NODE_ENV || 'development',
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://localhost:8001/predict',
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  ALERT_EMAIL_TO: process.env.ALERT_EMAIL_TO,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_FROM: process.env.TWILIO_WHATSAPP_FROM,
  TWILIO_WHATSAPP_TO: process.env.TWILIO_WHATSAPP_TO,
};

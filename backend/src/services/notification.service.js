import nodemailer from 'nodemailer';
import axios from 'axios';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

let transporter = null;
const getTransporter = () => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
  return transporter;
};

/**
 * Send an email alert (e.g. SLA breach risk) to the ops team.
 */
export const sendEmailAlert = async ({ subject, html, to }) => {
  try {
    const t = getTransporter();
    await t.sendMail({
      from: `"Eluno Order Alerts" <${env.SMTP_USER}>`,
      to: to || env.ALERT_EMAIL_TO,
      subject,
      html,
    });
    logger.info('Email alert sent:', subject);
    return true;
  } catch (err) {
    logger.error('Email alert failed:', err.message);
    return false;
  }
};

/**
 * Send a WhatsApp alert via Twilio WhatsApp API.
 */
export const sendWhatsAppAlert = async ({ message, to }) => {
  try {
    const sid = env.TWILIO_ACCOUNT_SID;
    const token = env.TWILIO_AUTH_TOKEN;
    const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;

    const params = new URLSearchParams();
    params.append('From', env.TWILIO_WHATSAPP_FROM);
    params.append('To', to || env.TWILIO_WHATSAPP_TO);
    params.append('Body', message);

    await axios.post(url, params, {
      auth: { username: sid, password: token },
    });
    logger.info('WhatsApp alert sent');
    return true;
  } catch (err) {
    logger.error('WhatsApp alert failed:', err.message);
    return false;
  }
};

/**
 * Convenience wrapper: send a breach-risk alert via both channels.
 */
export const sendBreachAlert = async (order, prediction) => {
  const subject = `⚠️ SLA Breach Risk: Order ${order.orderNumber}`;
  const html = `
    <h3>Order ${order.orderNumber} is at risk of breaching SLA</h3>
    <ul>
      <li>Current Status: ${order.currentStatus}</li>
      <li>Lens Type: ${order.lensType}</li>
      <li>Store: ${order.storeLocation}</li>
      <li>SLA Deadline: ${new Date(order.slaDeadline).toLocaleString()}</li>
      <li>Predicted Breach Probability: ${(prediction.breachProbability * 100).toFixed(0)}%</li>
      <li>Predicted Remaining Hours of Work: ${prediction.predictedRemainingHours}</li>
    </ul>
  `;
  const message = `⚠️ Order ${order.orderNumber} (${order.lensType}, ${order.storeLocation}) is at risk of SLA breach. Breach probability: ${(prediction.breachProbability * 100).toFixed(0)}%. Current status: ${order.currentStatus}.`;

  const emailResult = await sendEmailAlert({ subject, html });
  const whatsappResult = await sendWhatsAppAlert({ message });

  return { emailResult, whatsappResult };
};

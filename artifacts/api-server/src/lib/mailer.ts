import nodemailer from "nodemailer";
import { logger } from "./logger";

const GMAIL_USER = "leonbloxofficial@gmail.com";

function createTransport() {
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass },
  });
}

export async function sendMail(subject: string, text: string): Promise<void> {
  const transport = createTransport();
  if (!transport) {
    logger.warn("GMAIL_APP_PASSWORD not set — email notification skipped");
    return;
  }
  try {
    await transport.sendMail({
      from: `"LeonBlox Site" <${GMAIL_USER}>`,
      to: GMAIL_USER,
      subject,
      text,
    });
  } catch (err) {
    logger.error({ err }, "Failed to send email notification");
  }
}

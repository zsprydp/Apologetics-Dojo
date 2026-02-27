import { resend, FROM_EMAIL, isEmailEnabled } from "./client";
import { welcomeEmail, weeklyDigestEmail } from "./templates";

export async function sendWelcomeEmail(
  to: string,
  displayName: string
): Promise<boolean> {
  if (!isEmailEnabled()) return false;
  const { subject, html } = welcomeEmail(displayName);
  try {
    await resend!.emails.send({ from: FROM_EMAIL, to, subject, html });
    return true;
  } catch (err) {
    console.error("Failed to send welcome email:", err);
    return false;
  }
}

export async function sendWeeklyDigest(
  to: string,
  displayName: string,
  stats: Parameters<typeof weeklyDigestEmail>[1]
): Promise<boolean> {
  if (!isEmailEnabled()) return false;
  const { subject, html } = weeklyDigestEmail(displayName, stats);
  try {
    await resend!.emails.send({ from: FROM_EMAIL, to, subject, html });
    return true;
  } catch (err) {
    console.error("Failed to send weekly digest:", err);
    return false;
  }
}

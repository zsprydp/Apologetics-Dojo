import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

export const resend = apiKey ? new Resend(apiKey) : null;

export const FROM_EMAIL =
  process.env.EMAIL_FROM ?? "Apologetics Dojo <noreply@apologeticsdojo.com>";

export function isEmailEnabled(): boolean {
  return resend !== null;
}

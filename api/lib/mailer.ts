import { env } from "./env";

export const escapeHtml = (v: string) => v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Sends through Resend (https://resend.com). Returns false, and prints the message, when email is not configured. */
export async function sendMail(msg: { to: string; subject: string; text: string; html?: string; replyTo?: string }): Promise<boolean> {
  if (!env.resendApiKey || !env.emailFrom) {
    console.log(`[mail] Email not configured. To: ${msg.to}\nSubject: ${msg.subject}\n${msg.text}`);
    return false;
  }
  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${env.resendApiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ from: env.emailFrom, to: [msg.to], subject: msg.subject, text: msg.text, html: msg.html, reply_to: msg.replyTo }),
    });
    if (!resp.ok) { console.warn("[mail] Send failed:", resp.status, await resp.text()); return false; }
    return true;
  } catch (e) {
    console.warn("[mail] Send failed:", e);
    return false;
  }
}

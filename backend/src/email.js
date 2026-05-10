import { Resend } from "resend";

const resend = new Resend(process.env.EMAIL_API_KEY);

export async function sendEmail(email, subject, html) {
  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: subject,
    html: html,
  });

  if (error) {
    return { code: 500, error };
  }

  return { code: 200, data };
}

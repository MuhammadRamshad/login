import nodemailer from "nodemailer";

export async function sendVerificationEmail(email, token) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verifyLink = `http://localhost:5000/api/auth/verify/${token}`;

  await transporter.sendMail({
    from: "muhammadramshad07@gmail.com",
    to: email,
    subject: "Verify Your Email",
    html: `
      <h2>Email Verification</h2>
      <p>Click the link to verify:</p>
      <a href="${verifyLink}">Verify Email</a>
    `,
  });
}

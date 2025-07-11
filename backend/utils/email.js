import nodemailer from "nodemailer";

// Configure the email transporter (using Gmail as an example)
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    console.log("Sending email with the following details:");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("From:", process.env.EMAIL_USER);

    const mailOptions = {
      from: `PetCare System <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};
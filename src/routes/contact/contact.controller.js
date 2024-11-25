import nodemailer from "nodemailer";

export const sendEmail = async (req, res) => {
  const { name, email, phone, message } = req.body;

  // Validate input
  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // Email service
      auth: {
        user: process.env.SENDER_EMAIL, // Email address
        pass: process.env.SENDER_PASSWORD, // App-specific password
      },
    });

    // HTML content for the email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4CAF50;">Eco-Wild Website: New Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong></p>
        <p style="border-left: 4px solid #4CAF50; padding-left: 10px; color: #555;">${message}</p>
        <hr style="border: none; border-top: 1px solid #ddd;" />
        <footer style="font-size: 0.9em; color: #777;">
          This email was sent from your web application.
        </footer>
      </div>
    `;

    // Email options
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: process.env.RECEIVER_EMAIL, // Recipient's email
      subject: `New Message from ${name}`,
      html: htmlContent,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ status: "Success", message: "Email sent successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
